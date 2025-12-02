// Esto conecta el mundo FÍSICO con el PLC virtual
export const lookupByPhysical = Object.create(null);

/*
  La tabla quedará así:

  lookupByPhysical["192.168.1.10#1#1"] = 1000
  lookupByPhysical["192.168.1.20#4#10"] = 2000
  lookupByPhysical["192.168.1.30#2#202"] = 3003

  Clave:   ip#slave#modbus_addr
  Valor:   final_addr
*/
