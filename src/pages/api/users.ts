/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";

// JWT(Storage)
// Next Auth(Social)
// Cognito, Auth0

export default (request: NextApiRequest, response: NextApiResponse) => {
  const users = [
    { id: 1, name: "Henrique" },
    { id: 2, name: "Felipe" },
    { id: 3, name: "Jeniffer" },
  ];

  return response.json(users);
};
