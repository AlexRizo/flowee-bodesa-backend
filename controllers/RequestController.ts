import { Request, Response } from "express";
import { Request as RequestModel, Status } from "../models/RequestModel";
import { User } from "../models/UserModel";
import { Board } from "../models/BoardModel";
import { RequestController } from "./controllers.interface";
import { deleteFiles, uploadFiles } from "../helpers/cloudinaryConfig";

export const getRequests: RequestController = async (
  req: Request,
  res: Response
) => {
  const { boardSlug } = req.params;

  try {
    const boardExists = await Board.findOne({ slug: boardSlug });
    if (!boardExists) {
      return res.status(404).json({
        message: "No se encontró el tablero",
        ok: false,
        redirect: true,
      });
    }
    
    const requests = await RequestModel.find({ board: boardExists.id })
      .populate('author', 'id name avatar')
      .populate('board', 'id name');

    return res.status(200).json({
      ok: true,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ha ocurrido un error desconocido. ERR [500]", ok: false });
  }
};

export const createRequest: RequestController = async (
  req: Request,
  res: Response
) => {
  const { board, finishDate, ...rest } = req.body;
  const author = req.user;
  let files = [];

  try {
    const authorExists = await User.findById(author?.id);
    if (!authorExists) {
      return res.status(404).json({
        message: "No se encontró al usuario autor",
        ok: false,
      });
    }

    const boardExists = await Board.findOne({ slug: board });
    if (!boardExists) {
      return res.status(404).json({
        message: "No se encontró el tablero",
        ok: false,
      });
    }

    if (req.files?.length) {
      for (const file of req.files as Express.Multer.File[]) {
        const result = await uploadFiles(file.buffer, file.fieldname);
        files.push(result);
      }
    }

    const request = await RequestModel.create({
      ...rest,
      author: authorExists.id,
      board: boardExists.id,
      finishDate: new Date(finishDate),
      files,
    });

    return res.status(201).json({
      message: "Se ha creado la solicitud correctamente",
      ok: true,
      request,
    });
  } catch (error) {
    console.error(error);
    deleteFiles(files);
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

    const updatedRequest = await RequestModel.findByIdAndUpdate(requestId, { status }, { new: true });

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
