export default async (request: Request) => {
  return Response.json({
    success: true,
    message: "Smart Kitchen AI backend is connected!",
    application: "olla"
  });
};
