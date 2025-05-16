import { Request, Response } from "express";
import { Request as RequestModel, Status } from "../models/RequestModel";
import { User } from "../models/UserModel";
import { Board } from "../models/BoardModel";
import { RequestController } from "./controllers.interface";
import { deleteFiles, uploadFiles } from "../helpers/cloudinaryConfig";
import { Role } from "../interfaces/models.interfaces";
import mongoose from "mongoose";

const getRequestByRole = async (
  role: Role,
  userId: string,
  boardId: string
) => {
  let query: any = {};

  const isAdmin = [
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.ADMIN_DESIGN,
    Role.ADMIN_PUBLISHER,
  ];

  if (!isAdmin.includes(role)) {
    query = {
      $or: [{ author: userId }, { assignedTo: userId }],
      board: boardId,
    };
  } else {
    query = {
      board: boardId,
    };
  }

  const requests = await RequestModel.find(query)
    .populate("author", "id name avatar")
    .populate("assignedTo", "id name avatar")
    .populate("board", "id name initials color");

  return requests;
};

export const getRequests: RequestController = async (
  req: Request,
  res: Response
) => {
  const { boardSlug } = req.params;
  const { user } = req;

  try {
    const userExists = await User.findById(user?.id);
    if (!userExists) {
      return res.status(404).json({
        message: "No se encontró el usuario",
        ok: false,
      });
    }

    const boardExists = await Board.findOne({ slug: boardSlug });
    if (!boardExists) {
      return res.status(404).json({
        message: "No se encontró el tablero",
        ok: false,
        redirect: true,
      });
    }

    const requests = await getRequestByRole(
      userExists.role,
      userExists.id,
      boardExists.id
    );

    return res.status(200).json({
      ok: true,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ha ocurrido un error desconocido. ERR [500]",
      ok: false,
    });
  }
};

// ? Para autoasignaciones;
export const getMyRequests: RequestController = async (
  req: Request,
  res: Response
) => {
  const { user } = req;

  try {
    if (!user) {
      return res.status(404).json({
        message: "No se encontró el usuario",
        ok: false,
      });
    }

    const requests = await RequestModel.find({
      assignedTo: user.id,
      isAutoAssigned: true,
    })
      .populate("author", "id name avatar")
      .populate("assignedTo", "id name avatar")
      .populate("board", "id name slug initials color");

    return res.status(200).json({
      ok: true,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ha ocurrido un error desconocido. ERR [500]",
      ok: false,
    });
  }
};

export const getRequest: RequestController = async (
  req: Request,
  res: Response
) => {
  const { requestId } = req.params;

  try {
    const request = await RequestModel.findById(requestId)
      .populate("author", "id name avatar")
      .populate("assignedTo", "id name avatar")
      .populate("board", "id name initials color");

    if (!request) {
      return res.status(404).json({
        message: "No se encontró la solicitud",
        ok: false,
      });
    }

    return res.status(200).json({
      ok: true,
      request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ha ocurrido un error desconocido. ERR [500]",
      ok: false,
    });
  }
};

export const createRequest: RequestController = async (
  req: Request,
  res: Response
) => {
  const { board, finishDate, ...rest } = req.body;
  const author = req.user;

  const boardIsId = mongoose.Types.ObjectId.isValid(board);

  const { isAuto } = req.query;
  const isAutoAssign = isAuto === "true" ? true : false;

  const files = req.files as {
    files?: Express.Multer.File[];
    referenceFiles?: Express.Multer.File[];
  };

  let filesUploaded: {
    files: { publicId: string; secureUrl: string }[];
    referenceFiles: { publicId: string; secureUrl: string }[];
  } = {
    files: [],
    referenceFiles: [],
  };

  try {
    const authorExists = await User.findById(author?.id);
    if (!authorExists) {
      return res.status(404).json({
        message: "No se encontró al usuario autor",
        ok: false,
      });
    }

    const boardExists = await Board.findOne({
      $or: [
        { slug: board },
        ...(boardIsId ? [{ _id: board }] : [])
      ]
    });

    if (!boardExists) {
      return res.status(404).json({
        message: "No se encontró el tablero",
        ok: false,
      });
    }

    if (files.files?.length) {
      for (const file of files.files as Express.Multer.File[]) {
        const result = await uploadFiles(file.buffer, file.originalname, "files");
        filesUploaded.files.push(result);
      }
    }

    if (files.referenceFiles?.length) {
      for (const file of files.referenceFiles as Express.Multer.File[]) {
        const result = await uploadFiles(file.buffer, file.originalname, "reference_files");
        filesUploaded.referenceFiles.push(result);
      }
    }

    const request = await RequestModel.create({
      ...rest,
      author: authorExists.id,
      board: boardExists.id,
      finishDate: new Date(finishDate),
      files: filesUploaded.files,
      referenceFiles: filesUploaded.referenceFiles,
      assignedTo: isAutoAssign ? authorExists.id : null,
      isAutoAssigned: isAutoAssign,
    });

    return res.status(201).json({
      message: "Se ha creado la solicitud correctamente",
      ok: true,
      request,
    });
  } catch (error) {
    console.error(error);
    deleteFiles(filesUploaded.files);
    deleteFiles(filesUploaded.referenceFiles);
    return res.status(500).json({
      message: "Ha ocurrido un error desconocido. ERR [500]",
      ok: false,
    });
  }
};

export const updateRequestStatus: RequestController = async (
  req: Request,
  res: Response
) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const requestExists = await RequestModel.findById(requestId);
    if (!requestExists) {
      return res.status(404).json({
        message: "No se encontró la solicitud",
        ok: false,
      });
    }

    if (!Object.values(Status).includes(status)) {
      return res.status(400).json({
        message: "El estado no es válido",
        ok: false,
      });
    }

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    return res.status(200).json({
      message: "Se ha actualizado la solicitud correctamente",
      ok: true,
      updatedRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ha ocurrido un error desconocido. ERR [500]",
      ok: false,
    });
  }
};
