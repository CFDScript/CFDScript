//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

/**
 * Generate one-dimensional mesh
 * @param {*} nex - Number of elements along the x-axis
 * @param {*} xlast - Last x-coordinate of the mesh
 * @returns 
 */
export function genMesh1D(nex, xlast) {

  // Initialize arrays and variables
  let axpt = []; // Array to store x-coordinates (global) of nodes
  const xfirst = 0; // Starting x-coordinate
  let nnx = 2 * nex + 1; // Total number of nodes along x-axis
  const deltax = (xlast - xfirst) / nex; // Spacing between nodes along x-axis

    // Calculate x coordinates of nodes
    axpt[0] = xfirst;
    for (let i = 1; i < nnx; i++) {
      axpt[i] = axpt[i-1] + deltax;
    }

  // Return the generated coordinates and mesh information
  return { axpt, nnx };
}

/**
 * Generate two-dimensional structured mesh
 * @param {*} nex - Number of elements along the x-axis
 * @param {*} ney - Number of elements along the y-axis
 * @param {*} xlast - Last x-coordinate of the mesh
 * @param {*} ylast - Last y-coordinate of the mesh
 * @returns 
 */
export function genStructMesh2D(nex, ney, xlast, ylast) {

  // Initialize arrays and variables
  let axpt = []; // Array to store x-coordinates of nodes (local numbering)
  let aypt = []; // Array to store y-coordinates of nodes (local numbering)
  const xfirst = 0; // Starting x-coordinate
  const yfirst = 0; // Starting y-coordinate
  let nnx = 2 * nex + 1; // Total number of nodes along x-axis
  let nny = 2 * ney + 1; // Total number of nodes along y-axis
  const deltax = (xlast - xfirst) / nex; // Spacing between nodes along x-axis
  const deltay = (ylast - yfirst) / ney; // Spacing between nodes along y-axis

  // Calculate x-y global coordinates of nodes
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
  return { axpt, aypt, nnx, nny };
}

/**
 * Generate nop array for two-dimensional structured mesh
 * @param {*} nex - Number of elements along the x-axis
 * @param {*} ney - Number of elements along the y-axis
 * @param {*} nnx - Total number of nodes along the x-axis
 * @param {*} nny - Total number of nodes along the y-axis
 * @returns 
 */
export function nodNumStruct2D(nex, ney, nnx, nny) {

  // Nodal numbering
  let nel = 0;
  let nop = [];

  // Initialize nop array with zeros
  for (let i = 0; i < nex * ney; i++) {
    nop.push([]);
    for (let j = 0; j < 9; j++) {
      nop[i][j] = 0;
    }
  }

  // Assign node numbers to elements
  for (let i = 1; i <= nex; i++) {
    for (let j = 1; j <= ney; j++) {
      for (let k = 1; k <= 3; k++) {
        let l = 3 * k - 2;
        nop[nel][l - 1] = nny * (2 * i + k - 3) + 2 * j - 1;
        nop[nel][l] = nop[nel][l - 1] + 1;
        nop[nel][l + 1] = nop[nel][l - 1] + 2;
      }
      nel = nel + 1;
    }
  }

  // Return the generated nop array
  return nop;
}

/**
 * Generate two-dimensional elliptic mesh
 * @param {*} nex - Number of elements along the x-axis
 * @param {*} ney - Number of elements along the y-axis
 * @param {*} xlast - Total number of nodes along the x-axis
 * @param {*} ylast - Total number of nodes along the y-axis
 */
export function genElliMesh2D(nex, ney, xlast, ylast) {

}