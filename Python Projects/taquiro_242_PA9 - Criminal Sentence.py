#-------------------------------------------------------------------------------
# Name: Tyler John Aquiro
# Assignment 9
# Due Date: 5/4/2022
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

class Criminal:
	#contructs the criminal's profile
	def __init__(self, name, num_fraud, num_assault, num_murder, victims=[]):
		if not((num_fraud + num_assault + num_murder) == len(victims)):
			raise InfoError("No. of crimes and no. of victims must match!")
		self.name = str(name) #gives the name perameter
		self.num_fraud = int(num_fraud) #gives the number of fraud charges
		self.num_assault = int(num_assault) #gives the number of assault charges
		self.num_murder = int(num_murder) #gives the number of murder charges
		self.victims = victims #adds a list of victims to the criminal
	def __str__(self):
		s = f"Criminal {self.name}: fraud {self.num_fraud}, assault {self.num_assault}, murder {self.num_murder}."

		#truns all data into a string

		return s
	def add_crimes(self, crimes):
		if not(type(crimes) == dict): #makes sure the parameter passed in is a dictionary
			raise InfoError("Crime information must be in a dictionary.")
		for key in crimes: #for each key in the dictionary
			if key == "fraud":
				for x in crimes[key]:
					if not(x in self.victims):
					#if the key's values isn't already in the list of victims
						self.victims.append(x)
						self.num_fraud += 1
					#add it to the list of victims and add 1 to the charge
					#same process for assault and murder charges
			if key == "assault":
				for x in crimes[key]:
					if not(x in self.victims):
						self.victims.append(x)
						self.num_assault += 1
			if key == "murder":
				for x in crimes[key]:
					if not(x in self.victims):
						self.victims.append(x)
						self.num_murder += 1



	def exonerate(self, crimes):
		if not(type(crimes) == dict): #makes sure the parameter passed in is a dictionary
			raise InfoError("Crime information must be in a dictionary.")
		for key in crimes: #for each key in the dictionary
			if key == "fraud":
				for x in crimes[key]:
					if x in self.victims:
					# if the key's values is in the list of victims
						self.victims.remove(x)
						self.num_fraud -= 1
					#remove it to the list of victims and subtract 1 from the charge
					#same process for assault and murder charges
			if key == "assault":
				for x in crimes[key]:
					if x in self.victims:
						self.victims.remove(x)
						self.num_assault -= 1
			if key == "murder":
				for x in crimes[key]:
					if x in self.victims:
						self.victims.remove(x)
						self.num_murder -= 1

class InfoError(Exception): #creates the info error exception
	def __init__(self, msg):
		self.msg = (msg)
	def __str__(self):
		return(self.msg)