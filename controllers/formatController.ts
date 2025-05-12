import { Request, Response } from "express";
import { Format } from "../models/FormatModel";
import { RESULTS_PER_PAGE } from "../helpers/utils";
import { Category } from "../models/CategoryModel";

export const getFormats = async (req: Request, res: Response) => {
  const { page = 1 } = req.query;
  const skip = (Number(page) - 1) * RESULTS_PER_PAGE;

  try {
    const formats = await Format.find()
      .skip(skip)
      .limit(RESULTS_PER_PAGE)
      .populate('belongsTo', 'name');

    const total = await Format.countDocuments();

    res.status(200).json({
      ok: true,
      formats,
      total: Math.ceil(total / RESULTS_PER_PAGE)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener los formatos"
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  const { page = 1 } = req.query;
  const skip = (Number(page) - 1) * RESULTS_PER_PAGE;

  try {
    const categories = await Category.find()
      .skip(skip)
      .limit(RESULTS_PER_PAGE);

    const total = await Category.countDocuments();

    res.status(200).json({
      ok: true,
      categories,
      total: Math.ceil(total / RESULTS_PER_PAGE)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener las categorías"
    });
  }
};

export const createFormat = async (req: Request, res: Response) => {
  const { name, slug, belongsTo, description } = req.body;

  try {
    const slugFormatExists = await Format.findOne({ slug });

    if (slugFormatExists) {
      return res.status(400).json({
        ok: false,
        message: "El slug del formato ya existe"
      });
    }

    const category = await Category.findOne({ slug: belongsTo });

    if (!category) {
      return res.status(400).json({
        ok: false,
        message: "La categoría no existe"
      });
    }

    await Format.create({ name, slug, belongsTo: category._id, description });

    res.status(201).json({
      ok: true,
      message: "Formato creado correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al crear el formato"
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  try {
    const slugCategoryExists = await Category.findOne({ slug });  

    if (slugCategoryExists) {
      return res.status(400).json({
        ok: false,
        message: "El slug de la categoría ya existe"
      });
    } 

    await Category.create({ name, slug });

    res.status(201).json({
      ok: true,
      message: "Categoría creada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al crear la categoría"
    });
  }
};

export const searchCategories = async (req: Request, res: Response) => {
  const { value } = req.query;

  
  try { 
    const categories = await Category.find({ name: { $regex: value, $options: 'i' } });

    console.log(value);
    
    res.status(200).json({ ok: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al buscar la categoría"
    });
  }
};

