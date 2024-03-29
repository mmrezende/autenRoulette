import { validationResult } from 'express-validator';

export default (validator) => async (req, res, next) => {
    await Promise.all(
        validator.map(validation => validation.run(req))
    );

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res.status(422).json({ errors: errors.array() });
}