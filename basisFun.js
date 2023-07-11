//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

// Basis functions
export function basisFun2DQuad(x, y) {
  
  var ph = [];
  var phic = [];
  var phie = [];

  function l1(c){
    return 2 * c ** 2 - 3 * c + 1;
  }
  function l2(c){
    return - 4 * c ** 2 + 4 * c;
  }
  function l3(c){
    return 2 * c ** 2 - c;
  }
  function dl1(c){
    return 4 * c - 3;
  }
  function dl2(c){
    return - 8 * c + 4;
  }
  function dl3(c){
    return 4 * c - 1;
  }
  
  // Evaluate basis functions
  ph[0] = l1(x) * l1(y);
  ph[1] = l1(x) * l2(y);
  ph[2] = l1(x) * l3(y);
  ph[3] = l2(x) * l1(y);
  ph[4] = l2(x) * l2(y);
  ph[5] = l2(x) * l3(y);
  ph[6] = l3(x) * l1(y);
  ph[7] = l3(x) * l2(y);
  ph[8] = l3(x) * l3(y);
  
  // Evaluate x-derivative of basis functions
  phic[0] = l1(y) * dl1(x);
  phic[1] = l2(y) * dl1(x);
  phic[2] = l3(y) * dl1(x);
  phic[3] = l1(y) * dl2(x);
  phic[4] = l2(y) * dl2(x);
  phic[5] = l3(y) * dl2(x);
  phic[6] = l1(y) * dl3(x);
  phic[7] = l2(y) * dl3(x);
  phic[8] = l3(y) * dl3(x);
  
  // Evaluate y-derivative of basis functions
  phie[0] = l1(x) * dl1(y);
  phie[1] = l1(x) * dl2(y);
  phie[2] = l1(x) * dl3(y);
  phie[3] = l2(x) * dl1(y);
  phie[4] = l2(x) * dl2(y);
  phie[5] = l2(x) * dl3(y);
  phie[6] = l3(x) * dl1(y);
  phie[7] = l3(x) * dl2(y);
  phie[8] = l3(x) * dl3(y);
  
  // Return the evaluated basis functions and derivatives
  return {ph, phic, phie};
}
