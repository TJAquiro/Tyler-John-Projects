# PA2template.py

#for this function it checks if the wavelength is less than a certain value
def spectral_color(wavelength):
   if (wavelength < 380): #If this statement is true it will be catagorized under that color 
      result = "ultraviolet"
   elif (wavelength < 450): #Else it will move on to check the next color
      result = "violet"
   elif (wavelength < 485):
      result = "blue"
   elif (wavelength < 500):
      result = "cyan"
   elif (wavelength < 565):
      result = "green"
   elif (wavelength < 590):
      result = "yellow"
   elif (wavelength < 625):
      result = "orange"
   elif (wavelength < 750):
      result = "red"
#If the wavelength doesn't pass any of the previous checks I will be catagorized "infrared""
   else:
      result = "infrared"
    
   return result


def robot_actions(side_sensor, front_sensor, dirt_sensor):
#if dirt is detected "vacuum"
   if (dirt_sensor == "dirt"):
      result = "vacuum"
#otherwise if there is a wall in front "turn"
   elif (front_sensor == "wall"):
      result = "turn"
   elif (front_sensor == "clear"):
#otherwise if there is a wall on it's side "forward"
      if (side_sensor == "wall"):
          result = "forward"
#otherwise "stop"
      else:
          result = "stop"
      
   return result

#percent change = (current value - initial value) divided by initial value
def bad_broker(price, prev_price):
   if ((price - prev_price) / (prev_price) > .5): #if the percent change is greater than 50% BUY
      result = "BUY"
   elif ((price - prev_price) / (prev_price) < -.5): #if the percent change is less than -50% HOLD
      result = "HOLD"
   else:
      result = "SELL" #otherwise SELL
    
   return result

