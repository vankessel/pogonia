import json
import sys
from pathlib import Path
from typing import Dict, List

import torch
import torch.nn.functional as F


def apply_to_leaf_list(state_dict, func, path=None):
    """
    Traverses through json tree, if subtree contains only lists and values then
    apply function to it.
    :param state_dict: State dict in json form (Lists instead of tensors)
    :param func: Function to apply. First argument will be a list of the current traversed path keys.
                 Second will be the value. (Mainly for transforming back into tensors)
    :param path: Path traversed through state dict
    :return:
    """
    if path is None:
        path = []

    if isinstance(state_dict, Dict):
        for key, value in state_dict.items():
            path.append(key)
            contains_dict = apply_to_leaf_list(value, func, path)
            if not contains_dict:
                func(path, value)
            path.pop()

        return True

    elif isinstance(state_dict, List):
        contains_dict = False
        for idx, value in enumerate(state_dict):
            path.append(idx)
            contains_dict = apply_to_leaf_list(value, func, path) or contains_dict
            path.pop()

        return contains_dict

    else:
        return False


if __name__ == '__main__':
    file_path = Path(sys.argv[1])

    with file_path.open() as f:
        state = json.load(f)
        f.seek(0)
        corrected = json.load(f)


    def correct(path, tensor):
        current_node = corrected
        for key in path[:-1]:
            current_node = current_node[key]

        tensor = torch.tensor(tensor)
        if tensor.dim() != 4:
            return

        print()
        print(tensor.shape)
        tensor = tensor.permute(0, 2, 3, 1)
        if tensor.shape == (64, 7, 7, 3):
            print("Padding first tensor")
            tensor = F.pad(tensor, [0, 1])

        if tensor.shape[-1] % 4 != 0:
            raise Exception("Tensor dimension not multiple of 4.")

        # Add a dimension right before the elements.
        # We want the elements to always have a size of 4,
        # so this secondary layer will enable that with a resize
        tensor = tensor.unsqueeze(-2)
        if path[1] < 12:
            tensor = tensor.reshape([
                tensor.shape[0],
                tensor.shape[1],
                tensor.shape[2],
                tensor.shape[-1] // 4,
                4
            ])

        # Now move that secondary dimension between features and rows
        tensor = tensor.permute(0, 3, 1, 2, 4)

        # Now we have:
        # Features
        # Feature RGBA layer (E.i. Rach RGBA kernel)
        # Row
        # Column
        # RBGA (Not literally, we're just going to use them as RGBA in the shader)
        print(path, tensor.shape)
        current_node[path[-1]] = tensor.numpy().tolist()

    apply_to_leaf_list(
        state,
        correct
    )

    with (file_path.parent / 'formatted_model.json').open('w') as f:
        json.dump(corrected, f)
