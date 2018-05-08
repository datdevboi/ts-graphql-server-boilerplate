import { genSchema } from "./../utils/genSchema";
import { generateNamespace } from "@gql2ts/from-schema";

import * as fs from "fs";
import * as path from "path";

const myNamespace = generateNamespace("GQL", genSchema());
fs.writeFile(path.join(__dirname, "../types/schema.d.ts"), myNamespace, err => {
  if (err) {
    console.log(err);
  }
});
