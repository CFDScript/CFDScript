//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

// Generate a two-dimensional structured mesh
export function createCoord2D(nex, ney, xlast, ylast) {
  
  // Initialize arrays and variables
  let axpt = []; // Array to store x-coordinates of nodes
  let aypt = []; // Array to store y-coordinates of nodes
  const xfirst = 0; // Starting x-coordinate
  const yfirst = 0; // Starting y-coordinate
  let nnx = 2 * nex + 1; // Total number of nodes along x-axis
  let nny = 2 * ney + 1; // Total number of nodes along y-axis
  const deltax = (xlast - xfirst) / nex; // Spacing between nodes along x-axis
  const deltay = (ylast - yfirst) / ney; // Spacing between nodes along y-axis

  // Calculate x-y coordinates of nodes
  axpt[0] = xfirst;
  aypt[0] = yfirst;
  for (let i = 1; i < nny; i++) {
    axpt[i] = axpt[0];
    aypt[i] = aypt[0] + i * deltay / 2;
  }
  for (let i = 1; i < nnx; i++) {
    const nnode = i * nny;
    axpt[nnode] = axpt[0] + i * deltax / 2;
    aypt[nnode] = aypt[0];
    for (let j = 1; j < nny; j++) {
      axpt[nnode+j] = axpt[nnode];
      aypt[nnode+j] = aypt[nnode] + j * deltay / 2;
    }
  }
  
  // Return the generated coordinates and mesh information
  return {axpt, aypt, nnx, nny};
}
