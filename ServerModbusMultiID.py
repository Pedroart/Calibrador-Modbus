from umodbus import conf
from umodbus.server.tcp import RequestHandler
from socketserver import TCPServer
from socketserver import ThreadingMixIn

# Important configuration
conf.SIGNED_VALUES = False

# MULTI-UNITID MEMORY
holding_registers = {
    1: [11] * 1000,   # Unit 1 -> HR = 11
    2: [22] * 1000,   # Unit 2 -> HR = 22
    4: [99] * 1000,  # Unit 10 -> HR = 99
}

# Custom server with threading enabled
class ThreadedTCPServer(ThreadingMixIn, TCPServer):
    allow_reuse_address = True

# Handler for FC3 Read Holding Registers
def read_hr(req_pdu, unit_id):
    start = req_pdu.register_address
    count = req_pdu.register_count

    print(f"[READ] Unit {unit_id}, HR[{start}:{start+count}]")

    return holding_registers[unit_id][start:start+count]


# Register handler
RequestHandler.handle_read_holding_registers = read_hr


if __name__ == "__main__":
    server = ThreadedTCPServer(("0.0.0.0", 502), RequestHandler)

    print("Servidor Modbus TCP Multi-UnitID LISTO (uModbus)")
    print("Puerto: 502")
    print("UnitIDs disponibles: 1, 2, 10")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Servidor detenido.")
