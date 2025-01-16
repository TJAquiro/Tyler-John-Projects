#-------------------------------------------------------------------------------
# Name: Tyler John Aquiro
# Assignment 7
# Due Date: 4/18/2022
#-------------------------------------------------------------------------------
# Honor Code Statement: I received no assistance on this assignment that
# violates the ethical guidelines set forth by professor and class syllabus.
#-------------------------------------------------------------------------------
# References: None
#-------------------------------------------------------------------------------
# Comments and assumptions: None
#-------------------------------------------------------------------------------
# NOTE: width of source code should be <=80 characters to be readable on-screen.
#2345678901234567890123456789012345678901234567890123456789012345678901234567890
# 10 20 30 40 50 60 70 80
#-------------------------------------------------------------------------------

def fraction_count(num1, num2):
    if (num1 / num2) % 1 == 0: #checks if the number is a decimal
        return(0)
    else: #if not the function is run again however...
        return(1 + fraction_count(int(num1 / num2), num2))
            # num1 becomes the quotient of num1 and num2
            # num2 stays the same

def concat_order(word1, word2):
    if len(word1) == 0:
        return ('') #if the parameters are empty return ''
    if len(word1) == 1: 
        return (word1 + word2) #once a one letter string is reached the letters are combined and returned
    else: #this part will continue to make the original 2 words smaller by taking off their first letters
            #the first letters are also added to the returned function
            #the function is run again untill it reaches a 1 letter string
        return (word1[0] + word2[0] + concat_order(word1[1:len(word1)], word2[1:len(word2)]))

def sum_product(some_list, i, j):
    if i > j: #ensures the parameters are valid, if not return 0
        return(0)
    if i == j: #if i and j are equal they are speaking of the same value in the list so that value is added
        return(some_list[i])
    if j - i == 1: #if j minus i equal 1 they are speaking of values in the list that are next to each other
                    #this is the base case of the function and will return the product of these values
        return(some_list[i] * some_list[j]) 
    else: #this will multply the values indicated by i and j 
            #the function is run again increasing i by 1 and decreasing j by 1
            #the return values of each are added up
        return((some_list[i] * some_list[j]) + sum_product(some_list, i+1, j-1))

def calc_res(some_list, res=0):
    if len(some_list) == 1: #this is the base case where the list length is 1
                            #checks weather to multply or add to res based on if the valus is odd or even
        if (some_list[-1] % 2) == 0:
            return(res * some_list[-1])
        else:
            return(res + some_list[-1])

            #below are recusive cases that will make the list smaller by deleting the last value
            #and passing it back into the function
            
    if some_list[-1] == 0: #if the number is 0 just add it to the running total (it won't effect anything)
        return(some_list[-1] + calc_res(some_list[0:len(some_list)-1], res))
    if (some_list[-1] % 2) == 0: #if the number is even multiply the running total by it
        return(some_list[-1] * calc_res(some_list[0:len(some_list)-1], res))
    else: #if the number is off add it to the running total
        return(some_list[-1] + calc_res(some_list[0:len(some_list)-1], res))