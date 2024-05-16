// product.router.js
import express from "express";
import Product from "../schemas/product.schema.js";
import Joi from "joi";

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  manager: Joi.string().required(),
  password: Joi.string().required(),
  status: Joi.string().valid("FOR_SALE", "SOLD_OUT").default("FOR_SALE"),
});

const passwordSchema = Joi.object({
  password: Joi.string().required(),
});

router.post("/products", async (req, res) => {
  try {
    const validation = await productSchema.validateAsync(req.body);
    const product = new Product(validation);
    await product.save();
    res.status(201).json({
      status: 201,
      message: "상품 등록에 성공했습니다.",
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.",
    });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}, "-password")
      .sort({ createdAt: -1 })
      .select("-__v");
    res.status(200).json({
      status: 200,
      message: "상품 목록 조회에 성공했습니다.",
      products: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.",
    });
  }
});

router.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId, "-password").select(
      "-__v"
    );
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "상품이 존재하지 않습니다.",
      });
    }
    res.status(200).json({
      status: 200,
      message: "상품 상세 조회에 성공했습니다.",
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.",
    });
  }
});

router.put("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const validation = await productSchema.validateAsync(req.body);
    const product = await Product.findByIdAndUpdate(productId, validation, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "상품이 존재하지 않습니다.",
      });
    }
    res.status(200).json({
      status: 200,
      message: "상품 수정에 성공했습니다.",
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.",
    });
  }
});

router.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const { password } = await passwordSchema.validateAsync(req.body);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "상품이 존재하지 않습니다.",
      });
    }
    if (password !== product.password) {
      return res.status(400).json({
        status: 400,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
    await product.delete();
    res.status(200).json({
      status: 200,
      message: "상품 삭제에 성공했습니다.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.",
    });
  }
});

export default router;