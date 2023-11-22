import { buildRoutePath } from './utils/build-route-path.js';


export const routes = [
  {
    path: buildRoutePath('/tasks'),
    method: 'GET',
    handler: async (req, res)=> {
      res.end('tasks');
    }
  },
];
