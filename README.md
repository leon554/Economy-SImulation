# 🏙️ Economy Simulation

This project simulates a small virtual economy where entities **work**, **manufacture**, **trade**, and **pay taxes**—all in pursuit of a better quality of life. The system is built with an **Entity-Component-System (ECS)** architecture to make behavior extensible and modular.

## 🎯 Overview

In this simulation:
- Entities represent economic agents such as individuals and banks.
- They **produce**, **trade**, **buy**, and **sell** materials.
- Each entity aims to **maximize its quality of life**, calculated as the **sum of the logarithms of its material quantities**.
- Entities **pay taxes to banks** and operate under simple economic rules.
- A **visualization** allows you to watch the economy evolve over time.


---

## 🧠 Core Concepts

- **Quality of Life**:  
  `QoL = Σ log(material_quantity + 1)`  

- **Trading Logic**:  
    Buyers choose which resource to buy based on which one will increase their quality of life (QoL) the most, or based on the resources they need to manufacture something new.

    Sellers offer only one resource for sale—the one whose loss will reduce their QoL the least. However, if all of a seller’s resources are of equal quantity, they will not be willing to sell anything that day.


- **Taxes**:  
  A portion of each transaction is collected as tax by the bank which is paid by the seller of that transaction.

- **Entity-Component-System (ECS)**:  
  Each entity is composed of reusable components (e.g., Inventory, SkilledWorker, UnskilledWorker), and systems process behavior for all relevant entities.

---


## 📸 Screenshots

---
![Untitled video - Made with Clipchamp (1)](https://github.com/user-attachments/assets/727ab389-ceef-4797-9b99-1041b9fade75)
![image](https://github.com/user-attachments/assets/f0ac969c-5256-4804-bde6-5dbe12edf8bc)
