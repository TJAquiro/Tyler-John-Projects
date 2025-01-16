# PA5template.py
#-------------------------------------------------------------------------------
# Name: Tyler John Aquiro
# Assignment 1
# Due Date: 4/12/2022
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

def fullCoverageClearance(dataDict=[]):
    if dataDict == []:
        return(None) #if no input is given it will automatically return none
    lst = []
    total = 0
    for key in dataDict:
        for amounts in (dataDict[key]["Paid"]):
            total += amounts #adds up the amounts in the dictionary
        if total >= 3000: #if the amounts add up to 3000 or more
            lst.append(True) #True is added to a running list
            total = 0
        else:
            lst.append(False) #otherwise false is added to the list
            total = 0
    return(lst)

def buildCoverageDictionary(paidList):
    dic = {} #An emtpy dictionary that will hold more dictionaries
    paymentdic = {'Paid' : []} #A dictionary where amounts will be added
    for details in paidList:
        for amounts in range(1,len(details)):
            paymentdic['Paid'].append(details[amounts]) #adds all the numarical amounts
                                                        #in a list as a value of the key "Paid"
        dic[details[0]] = paymentdic
        paymentdic = {'Paid' : []} #clears the list for the next person + values to be added

    return(dic)


def createNewCoverageList(namesList = 0, paymentList = 0):
    if namesList == 0 or paymentList == 0:
        return(None)
    CoverageList = []
    CoverageList2 = []
    for x in range(0,len(namesList)):
        CoverageList.append(namesList[x]) #creates a list with a name as it's first item
        for money in paymentList[x]:
            CoverageList.append(money) #adds the values assosiated with that name after
        CoverageList2.append(CoverageList) #adds this list to a list of lists
        CoverageList = [] #list is cleared and the process is restarted for the rest of the names
    return(CoverageList2)


def eligibility(args,args2 = 0):
    if type(args) == dict: #if a dictionary is detected run the dictionary algorithm(to output a list of T/F)
        return(fullCoverageClearance(args))
    if args2 == 0: #if no second argument is given turn args into a dictionary then run dictionary algorithm
        return(fullCoverageClearance(buildCoverageDictionary(args)))
    if type(args) == list: #if there are args is a list use an algorithm to combine args 1 and 2
                            #then turn that into a dictionary then run the dictionary algorithm
        return(fullCoverageClearance((buildCoverageDictionary((createNewCoverageList(args,args2))))))
    else:
        return(None)