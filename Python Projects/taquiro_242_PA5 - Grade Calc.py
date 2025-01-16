# PA5template.py
#-------------------------------------------------------------------------------
# Name: Tyler John Aquiro
# Assignment 1
# Due Date: 4/04/2022
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

def increment_attendance(seating, locations):
    for loc in locations:
	#for each ordered pair in the list
        seating[loc[0]][loc[1]] += 1
	# go to that ordered pair in the second list and add 1


def drop_lowest(scores, drop_number):
    lowest_score = 101
	#so the first score in the list replaces this variable make it higher than what's possible
    for scorelist in scores:
	#the code below will run for each list of scores
        for repetitions in range(1,drop_number[scores.index(scorelist)]+1):
	#checks how many repetitions are being asked for
            for score in scorelist:
                if score < lowest_score:
                    lowest_score = score
            scorelist.remove(lowest_score)
	#finds the lowest score and removes it
	#this will repeat if necessary
            lowest_score = 101

def organize_grades(grades, assignment_types, max_possible):
	diction = {'zy': [], 'lab': [], 'pa': [], 'mid1': [], 'mid2': [], 'final': []}
# A dictionary is created with necessary keys and blank values
	grades_assignments_maxes = []
	for i in range(0, len(grades)):
		grades_assignments_maxes.append([grades[i], assignment_types[i], max_possible[i]])
	# Combines all variables into one list (so it's easier to work with)
	for x in grades_assignments_maxes:
		if x[1] == 'zy':
			diction['zy'].append((x[0]) / (x[2]))
		if x[1] == 'lab':
			diction['lab'].append((x[0]) / (x[2]))
		if x[1] == 'pa':
			diction['pa'].append((x[0]) / (x[2]))
		if x[1] == 'mid1':
			diction['mid1'].append((x[0]) / (x[2]))
		if x[1] == 'mid2':
			diction['mid2'].append((x[0]) / (x[2]))
		if x[1] == 'final':
			diction['final'].append((x[0]) / (x[2]))
	# sorts out the grades into their respective keys and calculates their score
	return (diction)



def gbook_averages(names):
    newbook = {'zy': [], 'lab': [], 'pa': [], 'mid1': [],'mid2': [], 'final': []}
    sumofgrades = 0
	# A dictionary is created with necessary keys and blank values
    for i in names:
        for grades in names[i]:
            sumofgrades += grades
        if sumofgrades > 0 and len(names[i]) > 0:
	# ensures we won't be dividing by zero
            newbook[i] = (sumofgrades / len(names[i]))
	# takes the average and addes it to the new book
        else:
            newbook[i] = (0.0)
        sumofgrades = 0
	# if a zero or nothing is there 0.0 is added to the book
    return(newbook)


def course_grade(gbook, weights, replace):
	finalgrade = 0

	for assignment_type in gbook:
		for gradereplacer in replace:
			if gbook[gradereplacer] > gbook[replace[gradereplacer]]:
				gbook[replace[gradereplacer]] = gbook[gradereplacer]
	# checks if a grade can be replaced with a higher one from the replacer
		if assignment_type:
			finalgrade += gbook[assignment_type] * weights[assignment_type]
	# uses grade and wieght to figure of the student's final grade
	return (finalgrade)