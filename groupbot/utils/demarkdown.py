demarkdowned_table = str.maketrans({i: f"\\{i}" for i in ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']})

def demarkdown(s: str) -> str:
    return s.translate(demarkdowned_table)
