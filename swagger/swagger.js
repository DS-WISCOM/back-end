const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "32nd WISCOM",
      version: "1.0.0",
      description: "wiscom 홈페이지 제작을 위한 라우터 명세서",
    },
    host: "localhost:5000",
    basePath: "/",
  },
  apis: ["./routes/*.js", "./swagger/apis/*"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
