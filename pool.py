# pool.py

from config import POOL_PER_EVOL

# Simulasi memori, bisa pakai file kalau mau persistent
evol_pool_used = {name: 0 for name in POOL_PER_EVOL.keys()}

def check_and_reduce_pool(evol_name, amount):
    # Deteksi level dari nama
    for i in range(1, 8):
        if f"Evol {i}" in evol_name:
            if evol_pool_used[i] + amount > POOL_PER_EVOL[i]:
                return False
            evol_pool_used[i] += amount
            return True
    return False
  
