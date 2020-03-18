import torch
from torch import nn
import json
from to_json import dump_json

inputs = torch.ones(1, 3, 2, 2)


def create_conv(pad=0, opad=0):
    conv = nn.ConvTranspose2d(3, 2, 3, stride=2, padding=pad, output_padding=opad)
    conv.weight.data = torch.ones(54).reshape(conv.weight.shape)
    conv.weight.data[0][0][0][0] = 2
    conv.bias.data = torch.zeros(2)
    return conv


print("Input:")
print(inputs.shape)
print(inputs)

up = create_conv()
out = up(inputs)

print("ConvTranspose Weights:")
print(up.weight.data.shape)
print(up.weight.data)

print("Neither:")
print(out.shape)
print(out)

# up = create_conv(1, 0)
# out = up(inputs)
#
# print("Padding")
# print(out.shape)
# print(out)
#
# up = create_conv(0, 1)
# out = up(inputs)
#
# print("Output Padding:")
# print(out.shape)
# print(out)
#
# up = create_conv(1, 1)
# out = up(inputs)
#
# print("Both:")
# print(out.shape)
# print(out)

print("Saving")
dump_json(up.state_dict(), "SDT.json")

print("State Dict:")
print(up.state_dict()['weight'].shape)
print(up.state_dict())
