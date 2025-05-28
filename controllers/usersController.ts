import { Request, Response } from "express";
import { User, UserInterface } from "../models/UserModel";
import { encryptPassword, globalQuery, RESULTS_PER_PAGE } from "../helpers/utils";
import { Role } from "../interfaces/models.interfaces";
import { Request as RequestModel, Status } from "../models/RequestModel";

interface UserResponse {
  users: UserInterface[];
  page: number;
  total: number;
}

const getUsers = async (roles: string[] | 'ALL', page: number): Promise<UserResponse> => {
  let users: UserInterface[] = [];
  let query = {};
  const skip = (page - 1) * RESULTS_PER_PAGE;
  
  if (roles === 'ALL') {
    query = { ...globalQuery };
  } else {
    query = { role: { $in: roles }, ...globalQuery };
  }

  users = await User.find(query).skip(skip).limit(RESULTS_PER_PAGE).sort({ role: 1, createdAt: -1 });
  const total = await User.countDocuments(query);

  return {
    users,
    page,
    total: Math.ceil(total / RESULTS_PER_PAGE)
  };

}

export const getAllUsers = async (req: Request, res: Response): Promise<Response | void> => {
  const user = req.user;
  const page = parseInt(req.query.page as string) || 1;

  let response: UserResponse;

  try {
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Acceso denegado: Usuario desconocido"
      });
    }

    if (user.role === 'SUPER_ADMIN') {
      response = await getUsers('ALL', page);
      return res.status(200).json({
        ok: true,
        response
      });
    }

    if (user.role === 'ADMIN') {
      response = await getUsers(['ADMIN', 'ADMIN_DESIGN', 'ADMIN_PUBLISHER', 'PUBLISHER', 'DESIGNER'], page);
      return res.status(200).json({
        ok: true,
        response
      });
    }

    res.status(403).json({
      ok: false,
      message: "Acceso denegado: Usuario no autorizado"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error interno (Error en el servidor [500])"
    });
  }
}

export const createUser = async (req: Request, res: Response): Promise<Response | void> => {
  const { name, email, password, role } = req.body;

  try {
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        ok: false,
        message: "El correo electrónico ya está en uso"
      });
    }

    const encryptedPassword = encryptPassword(password);
    
    await User.create({ name, email, password: encryptedPassword, role });

    res.status(201).json({
      ok: true,
      user: {
        name,
        email,
        role,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error interno (Error en el servidor [500])"
    });
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) /* ? Validación de ID de MongoDB */ {
    return res.status(400).json({
      ok: false,
      message: "El ID del usuario no es válido"
    });
  }
  
  try {
    const user = await User.findByIdAndUpdate(id, { deleted: true });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: `No se encontró el usuario con el ID ${id}`
      });
    }
    
    res.status(200).json({
      ok: true,
      message: `El usuario con el ID ${id} ha sido eliminado`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error interno (Error en el servidor [500])"
    });
  }
}

export const getDesigners = async (req: Request, res: Response): Promise<Response | void> => {
  const user = req.user;

  try {
    const userExists = await User.findById(user?.id);

    if (!userExists) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    const designers = await User.find({ ...globalQuery, role: Role.DESIGNER })
    .select("id name avatar");

    const designersWithRequests = await Promise.all(
      designers.map(async (designer) => {
        const aggregated = await RequestModel.aggregate([
          {
            $match: { assignedTo: designer._id }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]);

        const requests = {
          awaiting: 0,
          inProgress: 0,
          pending: 0,
          total: 0
        }

        for(const item of aggregated) {
          if(item._id === Status.PENDING) {
            requests.pending = item.count;
          }

          if(item._id === Status.AWAITING) {
            requests.awaiting = item.count;
          }
          
          if (item._id === Status.IN_PROGRESS) {
            requests.inProgress = item.count;
          }
        }

        return {
          ...designer.toObject(),
          requests: {
            ...requests,
            total: requests.pending + requests.awaiting + requests.inProgress
          }
        };
      })
    );

    console.log(designersWithRequests);

    return res.status(200).json({
      ok: true,
      designers: designersWithRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error interno (Error en el servidor [500])"
    });
  }
}

