def cut_list(number_list):
    newlist = []
    for i in number_list:
        if i not in newlist:
            newlist.append(i)
    return(newlist)


def odd_even(sum):
    if sum % 2 == 0:
        return 0
    else:
        return 1

def sum_number(number_list):
    numbers = cut_list(number_list)
    summ = 0
    for i in numbers:
        summ += i
    if odd_even(summ) == 0:
        return(summ, "is even")
    if odd_even(summ) == 1:
        return(summ, "is odd")
