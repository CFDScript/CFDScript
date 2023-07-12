//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { createCoord2D } from './coordGen.js';
import { basisFun2DQuad } from './basisFun.js';

export function createLaplace2DMat(nex, ney, xlast, ylast) {

  // Definitions
  let x = [];
  let res = [];
  let jac = [];

  // Generate xy coordinates using createCoord2D function
  let { axpt, aypt, nnx, nny } = createCoord2D(nex, ney, xlast, ylast);

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

  // Initialize variables for matrix assembly
  const ne = nex * ney;
  const np = nnx * nny;
  let ntop = [];
  let ncod = [];
  let bc = [];
  let ngl = [];
  let gp = [];
  let wgp = [];
  let phx = [];
  let phy = [];
  let y;
  let x1;
  let x2;
  let y1;
  let y2;
  let dett;
  let m1;
  let n1;

  // Initialize jac and res arrays
  for (let i = 0; i < np; i++) {
    res[i] = 0;
    jac.push([]);
    for (let j = 0; j < np; j++) {
      jac[i][j] = 0;
    }
  }

  // Neumann boundary conditions
  for (let i = 0; i < ne; i++) {
    ntop[i] = 0;
  }

  // Define ntop for elements along y=yfirst
  //for (let i = 0; i < nex; i++) {
  //  ntop[i] = 1;
  //}

  // Define ntop for elements along y=ylast
  //for (let i = nex - 1; i < ne; i += nex) {
  //  ntop[i] = 1;
  //}

  // Define ntop for elements along x=xfirst
  //for (let i = 0; i < ne-ney; i += nex) {
  //  ntop [i] = 1;
  //}
  
  // Define ntop for elements along x=xlast
  //for (let i = ney - 1; i < ne; i += ney) {
  //  ntop[i] = 1;
  //}

  // Matrix assembly
  for (let i = 0; i < ne; i++) {

    for (let j = 0; j < 9; j++) {
      ngl[j] = nop[i][j] - 1;
    }

    // Gauss points and weights
    gp[0] = (1 - (3 / 5) ** 0.5) / 2;
    gp[1] = 0.5;
    gp[2] = (1 + (3/5) ** 0.5) / 2;
    wgp[0] = 5 / 18;
    wgp[1] = 8 / 18;
    wgp[2] = 5 / 18;

    // Loop over Gauss points
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {

        // Isoparametric mapping and derivatives using basisFun2DQuad function
        let { ph, phic, phie } = basisFun2DQuad(gp[j], gp[k]);
        x = 0;
        y = 0;
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;

        // Compute x and y coordinates and derivatives
        for (let n = 0; n < 9; n++) {
          x += axpt[ngl[n]] * ph[n];
          y += aypt[ngl[n]] * ph[n];
          x1 += axpt[ngl[n]] * phic[n];
          x2 += axpt[ngl[n]] * phie[n];
          y1 += aypt[ngl[n]] * phic[n];
          y2 += aypt[ngl[n]] * phie[n];
          dett = x1 * y2 - x2 * y1;
        }

        // Compute x-derivative and y-derivative of basis functions
        for (let n = 0; n < 9; n++) {
          phx[n] = (y2 * phic[n] - y1 * phie[n]) / dett;
          phy[n] = (x1 * phie[n] - x2 * phic[n]) / dett;
        }

        // Computation of Galerkin's residuals and Jacobian matrix
        for (let m = 0; m < 9; m++) {
          m1 = ngl[m];
          res[m1] += wgp[j] * wgp[k] * dett * ph[m];

          for (let n = 0; n < 9; n++) {
            n1 = ngl[n];
            jac[m1][n1] += -wgp[j] * wgp[k] * dett * (phx[m] * phx[n] + phy[m] * phy[n]);
          }
        }
      }
    }

    // Check for elements with ntop[nell]=1 to impose Neumann boundary condition
    if (ntop[i] == 1) {
      for (let n = 0; n < 3; n++) {
        let { ph, phic, phie } = basisFun2DQuad(gp[n], 1);
        x = 0;
        x1 = 0;
        for (let k = 0; k < 9; k++) {
          x += axpt[ngl[k]] * ph[k];
          x1 += axpt[ngl[k]] * phic[k];
        }
        for (let m1 = 2; m1 < 9; m1 += 3) {
          res[m1] += -wgp[n] * x1 * ph[m1];
        }
      }
    }
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    ncod[i] = 0;
    bc[i] = 0;
 }

  // Define ncod and bc for nodes on y=yfirst
  for (let i = 0; i < nnx; i++) {
    ncod[i] = 1;
    bc[i] = 1;
  }

  // Define ncod and bc for nodes on x=xfirst
  //for (let i = 0; i < np - nny + 1; i += nny) {
  //  ncod[i] = 1;
  //  bc[i] = 1;
  //}

  // Define ncod and bc for nodes on y=ylast
  //for (let i = nny - 1; i < np; i += nny) {
  //  ncod[i] = 1;
  //  bc[i] = 1;
  //}

  // Define ncod and bc for nodes on x=xlast
  for (let i = nnx - 1; i < np; i += nnx) {
    ncod[i] = 1;
    bc[i] = 1;
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    if (ncod[i] == 1) {
      res[i] = bc[i];
      for (let j = 0; j < np; j++) {
        jac[i][j] = 0;
        jac[i][i] = 1;
      }
    }
  }

  return { jac, res, nnx, nny, axpt, aypt };
}
