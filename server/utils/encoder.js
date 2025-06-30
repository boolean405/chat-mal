import { hashSync, compareSync } from "bcryptjs";

const Encoder = {
  encode: (password) => hashSync(password, 10),
  compare: (plain, hash) => compareSync(plain, hash),
};

export default Encoder;
