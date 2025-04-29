import { Request, Response } from "express";
import { Board } from "../models/BoardModel";
import { User, UserInterface } from "../models/UserModel";
import { globalQuery, RESULTS_PER_PAGE } from "../helpers/utils";

interface ControllerFunction {
  (req: Request, res: Response): ControllerResp;
}

type ControllerResp = Promise<Response | void>;

// ? Crear un tablero
export const createBoard: ControllerFunction = async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  try {
    const boardExists = await Board.findOne({ slug });

    if (boardExists) {
      return res.status(400).json({
        ok: false,
        message: `El tablero con el slug ${slug} ya existe.`,
      });
    }

    const board = await Board.create({ name, slug });

    res.status(201).json({
      ok: true,
      message: `Se ha creado el tablero ${slug} correctamente.`,
      board,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
};

// ? Obtener todos los tableros
export const getAllBoards: ControllerFunction = async (req: Request, res: Response) => {
  try {
    const boards = await Board.find();

    res.status(200).json({
      ok: true,
      boards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
};

// ? Obtener un tablero por su slug
export const getBoardBySlug: ControllerFunction = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const board = await Board.findOne({ slug });

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el slug ${slug} no existe.`,
      });
    }

    res.status(200).json({
      ok: true,
      board,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
};

// ? Obtener un tablero por su id
export const getBoardById: ControllerFunction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el id ${id} no existe.`,
      });
    }

    res.status(200).json({
      ok: true,
      board,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
};

// ? Obtener los usuarios de un tablero
export const getBoardUsers: ControllerFunction = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * RESULTS_PER_PAGE;

  if (!slug) return res.status(400).json({
    ok: false,
    message: "El slug del tablero es requerido.",
  });

  try {
    const board = await Board.findOne({ slug });

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el slug ${ slug } no existe.`,
      });
    }
    
    const users = await User.find({ boards: board.id, ...globalQuery }).select('id name email role').skip(skip).limit(RESULTS_PER_PAGE);
    const total = await User.countDocuments({ boards: board.id, ...globalQuery });

    res.status(200).json({
      ok: true,
      users,
      total: Math.ceil(total / RESULTS_PER_PAGE),
      page,
      board,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
}

// ? Obtener los tableros de un usuario
export const getUserBoards: ControllerFunction = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "No se ha encontrado el usuario.",
      });
    }

    const { boards } = await User.findById(user.id)
      .select("boards")
      .populate("boards") as UserInterface;

    res.status(200).json({
      ok: true,
      boards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ha ocurrido un error (Error en el servidor [500]).",
    });
  }
};

// ? Eliminar un usuario de un tablero
export const deleteUserFromBoard: ControllerFunction = async (req: Request, res: Response) => {
  const { boardSlug, userId } = req.params;

  try {
    const board = await Board.findOne({ slug: boardSlug }).select('id name');

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el slug ${boardSlug} no existe.`,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: `El usuario con el id ${userId} no existe.`,
      });
    }
    
    await User.findByIdAndUpdate(userId, { $pull: { boards: board.id } }).select('id name');

    res.status(200).json({
      ok: true,
      message: `El usuario ${user.name} ha sido removido del tablero ${board.name}.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error (Error en el servidor [500]).',
    });
  }
}

// ? Obtener los usuarios que se pueden agregar a un tablero
export const getUsersToAdd: ControllerFunction = async (req: Request, res: Response) => {
  const { boardSlug } = req.params;
  
  try {
    const board = await Board.findOne({ slug: boardSlug }).select('id');

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el slug ${boardSlug} no existe.`,
      });
    }

    const $query = {
      ...globalQuery,
      boards: { $ne: board.id },
      role: { $nin: ['ADMIN', 'SUPER_ADMIN'] }
    }

    const users = await User.find({ ...$query }).select('id name role');

    res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error (Error en el servidor [500]).',
    });
  }
}

// ? Agregar usuarios a un tablero
export const AddUsersToBoard: ControllerFunction = async (req: Request, res: Response) => {
  const { boardSlug } = req.params;
  const { users }: { users: string[] } = req.body;
  
  try {
    if (!users) {
      return res.status(400).json({
        ok: false,
        message: 'Los usuarios a agregar son requeridos.',
      });
    }
    
    const board = await Board.findOne({ slug: boardSlug }).select('id name');

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: `El tablero con el slug ${boardSlug} no existe.`,
      });
    }

    const usersToAdd = await User.find({ _id: { $in: users } }).select('id name role');

    // ? Agregar el tablero al/los usuario/s
    await User.updateMany(
      { _id: { $in: usersToAdd.map(u => u._id) } },
      { $addToSet: { boards: board._id } }
    );

    res.status(200).json({
      ok: true,
      message: `Los usuarios ${usersToAdd.map(user => user.name).join(', ')} han sido agregados al tablero ${board.name}.`,
      users: usersToAdd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error (Error en el servidor [500]).',
    });
  }
}

