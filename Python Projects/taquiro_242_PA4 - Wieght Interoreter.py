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

def biggest_vertebrate(animals, weights, vertebrates):
    AnimalWieghts1 = []
    AnimalWieghts2 = []
    heavyest = [0,0]

    for i in range(len(animals)):
        AnimalWieghts1.append([animals[i],weights[i]])

    #attaches each weight to each animal

    for y in AnimalWieghts1:
        for v in vertebrates:
            if v == y[0]:
                AnimalWieghts2.append(y)

    #if the animal is a verabrate add it's name and wieght to list AnimalWieghts2

    for x in AnimalWieghts2:
        if x[1] > heavyest[1]:
            heavyest = x
    if heavyest[0] == 0:
        return None
    else:
        return heavyest[0]

    #find the heaviest animal in list AnimalWieghts2


def within_weight(animals, weights, weightLimit):
    AnimalsBelowWeightLimit = []
    for i in range(len(animals)): 

    #for each animal in list animals
    
        if weights[i] <= weightLimit:

    #Check if it's wieght is equal or below the weightLimit

            AnimalsBelowWeightLimit.append(animals[i])

    #if so add to list AnimalsBelowWeightLimit

    return AnimalsBelowWeightLimit
    

def any_adjacent_vertebrates(animals, vertebrates):
    matchlst = []
    nomatch = 0
    for a in animals:
        nomatch = 0
        for v in vertebrates:
            if a == v: 
                matchlst.append(True) 

    #if the animal is a verabrate add true to list

            else:
                nomatch += 1
            if nomatch == len(vertebrates):
                matchlst.append(False)

    #if the animal is not a verabrate add false to list

    #A list of True and False is created

    for i in range(len(matchlst)):
        if i < len(matchlst) - 1:
            if matchlst[i] == matchlst[i+1] == True:
                return True
                break

    #if two trues are detected together return true

    return False

    #else false

def count_weights(weight_list):
    WieghtsAndposition = []
    equations = []
    weight_listNoDup = []
    [weight_listNoDup.append(wei) for wei in weight_list if wei not in weight_listNoDup]

    #make a copy of weight_list without duplicates

    for i in range(len(weight_list)):
        WieghtsAndposition.append([weight_list[i],i])
        
    #make a copy of weight_list with the weights and it's position in the list

    for x in WieghtsAndposition:
        for y in WieghtsAndposition:
            for z in weight_listNoDup:
                if (x[0] + y[0]) == z and (not(x[1] <= y[1])):
                    equations.append([y[0], "+", x[0], "=", z])
  
    #if a value in weight_list plus a DIFFERENT value in weight_list equals a value in weight_listNoDup
    #add that equation to a list of equations

    return len(equations)

    #return length of list of equations