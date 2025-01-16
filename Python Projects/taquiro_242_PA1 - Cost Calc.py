print("Sage\'s Wedding Cake Price Calculator")
people = int(input("Total People Attending: "))

#calculator for cake A

print("----------------------------------------")
print("Cake A")
#labor cost is amount of cake needed times time spent making it hours times their wage plus amount of cake needed times the consultant's wage
Labor_cost = float((people / 30) * (15 * 15) + ((people / 30) * 12.5))
print("Labor Cost:     $", round(Labor_cost, 2), sep = "")
#Cost_to_make is the amount of cake needed times ingedient cost
Cost_to_make = float((people / 30) * 35)
print("Cost to Make:   $", round((Cost_to_make + Labor_cost), 2), sep = "")
#Charge_Customer is the sum of Labor_cost and Cost_to_make plus 10%
Charge_Customer = ((1.1) * (Labor_cost + Cost_to_make))
print("Charge Customer: $", round(Charge_Customer, 2), sep = "")

#calculator for cake B

print("----------------------------------------")
print("Cake B")
Labor_cost = float((people / 30) * (15 * 14) + (2 * (people / 30) * 12.5))
print("Labor Cost:     $", round(Labor_cost, 2), sep = "")

Cost_to_make = float((people / 30) * 30)
print("Cost to Make:   $", round((Cost_to_make + Labor_cost), 2), sep = "")

Charge_Customer = ((1.1) * (Labor_cost + Cost_to_make))
print("Charge Customer: $", round(Charge_Customer, 2), sep = "")

#calculator for cake C

print("----------------------------------------")
print("Cake C")
Labor_cost = float((people / 30) * (15 * 16) + (1.5 * (people / 30) * 12.5))
print("Labor Cost:     $", (round(Labor_cost, 2)), sep = "")

Cost_to_make = float((people / 30) * 40)
print("Cost to Make:   $", round((Cost_to_make + Labor_cost), 2), sep = "")

Charge_Customer = ((1.1) * (Labor_cost + Cost_to_make))
print("Charge Customer: $", round(Charge_Customer, 2), sep = "")