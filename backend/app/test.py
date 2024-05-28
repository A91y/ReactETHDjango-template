from web3 import Web3
from eth_account.messages import encode_defunct
message = "Login request: 98b50e5d-9410-4a60-b325-b0e4f8129e78"
encoded_message = encode_defunct(text=message)
signature = "0x192a81e2736f06a834e7ffcdcda8c11608c2a994b8112892e5118b2992361d0e68c455f41382820fd15b12a26c3178c79afc18292871c02d3ef96087ef4e0df91c"
recovered_address = Web3().eth.account.recover_message(encoded_message, signature=signature)
print(recovered_address)