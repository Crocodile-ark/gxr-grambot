# evol.py

def get_evol_info(points):
    if points < 50:
        return "Evol 1 – Rookie", "assets/evol_1.png", 5
    elif points < 15000:
        return "Evol 2 – Charger", "assets/evol_2.png", 10
    elif points < 30000:
        return "Evol 3 – Breaker", "assets/evol_3.png", 15
    elif points < 50000:
        return "Evol 4 – Phantom", "assets/evol_4.png", 20
    elif points < 80000:
        return "Evol 5 – Overdrive", "assets/evol_5.png", 25
    elif points < 120000:
        return "Evol 6 – Genesis", "assets/evol_6.png", 30
    else:
        return "Evol 7 – Final Form", "assets/evol_7.png", 50
      
