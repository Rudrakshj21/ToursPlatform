module.exports = (fn) => {
  // this anonymous fn is gonna be called by express
  return (req, res, next) => {
    fn(req, res, next).catch(next);
    // shorthand for catch(err =>next(err))
  };
};  
