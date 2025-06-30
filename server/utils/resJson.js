const resJson = (res, status, message, result) => {
  res.status(status).json({
    status: true,
    message,
    result,
  });
};

export default resJson;
