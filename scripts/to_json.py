import json
from typing import Dict, List

from torch import Tensor


def unflatten_state_dict(state_dict, delim='.'):
    """
    Unflattens a dictionary by splitting keys with a delimiter
    Also transforms tensors into lists in prep for dumping to json:
    {
    'hello.0.world': Tensor([0, 1])
    'hello.2.universe': 1
    }

    returns:

    {
    'hello' : {
        '0': { 'world': [0, 1] }
        '2': { 'universe': 1 }
    }
    }
    :param state_dict:
    :param delim:
    :return:
    """
    new_dict = {}

    for key in list(state_dict.keys()):
        value = state_dict[key]

        if isinstance(value, Dict):
            new_dict[key] = unflatten_state_dict(value)

        else:
            if isinstance(value, Tensor):
                value = value.numpy().tolist()
            # This is a leaf of the dict. Split the key if it is splittable
            idx = key.find(delim)
            if idx == -1:
                new_dict[key] = value
                continue
            nkey = key[:idx]
            nsubkey = key[idx + 1:]
            if nkey not in new_dict:
                new_dict[nkey] = {}
            new_dict[nkey][nsubkey] = value
            new_dict[nkey] = unflatten_state_dict(new_dict[nkey])

    return new_dict


def parse_dict_list_keys(state_dict):
    """
    Traverse a dict for numeric string keys and transforms them into a list:
    {
    'hello' : {
        '0': { 'world': [0, 1] }
        '2': { 'universe': 1 }
    }
    }

    returns:

    {
    'hello' : [
        { 'world': [0, 1] }
        { 'universe': 1 }
    ]
    }
    :param state_dict:
    :return:
    """
    if isinstance(state_dict, Dict):
        if all(key.isdigit() for key in state_dict.keys()):
            new_list = []
            for value in state_dict.values():
                new_list.append(parse_dict_list_keys(value))
            return new_list

        new_dict = {}
        for key in list(state_dict.keys()):
            new_dict[key] = parse_dict_list_keys(state_dict[key])

        return new_dict

    elif isinstance(state_dict, List):
        new_list = []
        for value in state_dict:
            new_list.append(parse_dict_list_keys(value))

        return new_list

    return state_dict


def dump_json(state_dict, file_path):
    b = unflatten_state_dict(state_dict)
    c = parse_dict_list_keys(b)

    with open(file_path, 'w') as f:
        json.dump(c, f)
