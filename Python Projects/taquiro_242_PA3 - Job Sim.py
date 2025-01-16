#-------------------------------------------------------------------------------
# Name: Tyler John Aquiro
# Assignment 1
# Due Date: 2/28/2022
#-------------------------------------------------------------------------------
# Honor Code Statement: I received no assistance on this assignment that
# violates the ethical guidelines set forth by professor and class syllabus.
#-------------------------------------------------------------------------------
# References: (list resources used - remember, assignments are individual effort!)
#-------------------------------------------------------------------------------
# Comments and assumptions: A note to the grader as to any problems or
# uncompleted aspects of the assignment, as well as any assumptions about the
# meaning of the specification.
#-------------------------------------------------------------------------------
# NOTE: width of source code should be <=80 characters to be readable on-screen.
#2345678901234567890123456789012345678901234567890123456789012345678901234567890
# 10 20 30 40 50 60 70 80
#-------------------------------------------------------------------------------

def break_time(hours_worn, last_break):
   result = 0
   division = 0
   if hours_worn % last_break == 0:
   	# checks if hours_worn is already a factor of last_break
      return result
      # if so return zero
   else:
   	# if not continue to divide the quotient of hours_worn and last_break
   	# until an ineger is reached 
       division = hours_worn / last_break
       while not(division % 1 == 0):
          if not(division % last_break == 0):
             result += 1 
             # every time this loops 1 is added to the result
             division = int(division)
             division = (division / last_break)
   return result


def how_many_uruks(strength_values, init_fund_needed):
	result = 0
	buget = 0
	for value in strength_values:
	    if (value % 2 == 0) and not(value == 0):
	        buget = buget * value
	        # if the value in list is even the buget is muliplied
	    elif not(value == 0):
	        buget = buget + value
	        # else add if the value in list is odd
	while buget >= 0:
	    if buget - init_fund_needed >= 0:
	        buget = buget - init_fund_needed
	        init_fund_needed += 1
	        # every time it's looped 1 is added to init_fund_needed
	        result += 1
	        # subtract from the buget until 0 or a negative number is reached
	    else:
	        buget = -1
	        return result


def years_to_rule(n1, n2, n3):
    result = 0
    for i in range(1, n1 + 1):
        for x in range(1, n2 + 1):
        	#multiply each value in n1 by each value in n2
            result += ((i * x) // n3)
            #floor divide by n3
    return result


def lotr_popularity(char_list):
    gandalfappear = 0
    aragornappear = 0
    legolasappear = 0
    gandalfpoints = 0
    aragornpoints = 0
    legolaspoints = 0
    addition = 0
    result = []

    for i in char_list:
    	#for each mention of each name add a certain amount of points
    	#to their appear varible
        if i == "Gandalf":
            gandalfappear += 10
            gandalfpoints += 1
        elif i == "Aragorn":
            aragornappear += 20
            aragornpoints += 1
        elif i == "Legolas":
            legolasappear += 5
            legolaspoints += 1
    addition = (gandalfappear + aragornappear + legolasappear)
    #add all the appear variables
    if (gandalfpoints >= aragornpoints) and (gandalfpoints >= legolaspoints):
        result = "Most Appeared: Gandalf, Popularity: %s" % addition
    elif (aragornpoints >= gandalfpoints) and (aragornpoints >= legolaspoints):
        result = "Most Appeared: Aragorn, Popularity: %s" % addition
    else:
        result = "Most Appeared: Legolas, Popularity: %s" % addition
    #figure out which character appeared the most
    #append addition to the end


    return result