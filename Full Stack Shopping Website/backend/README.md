- All methods expect to receive an object in the request; almost all send an object or list of objects as a response. If you are writing a frontend API function and you want to return a primitive value, unpack it from the response object.
- All routes begin with http://localhost:3001/api



universal routes (implemented for all object types):

---"tablename" is just the plural of the object name, no hyphens/spaces/underscores and not case-sensitive.
e.g. the tablename of Customer is customers. The only exception is CardInfo, which has a tablename of "cards".---

	getXById (HTTP GET)

	 - route: /[x's tablename]/[id]

	 - request body fields: none

	 - response: X object

	getAllXs (HTTP GET)

	 - route: /[x's tablename]

	 - request body fields: none

	 - response: list of X[]

	createX (HTTP POST)

	 - route: /[x's tablename]

	 - request body: X object

	 	Notes: for Customers and BusinessOwners, a password field must be appended to the object before sending. 

	 - response: X object

	updateX (HTTP PUT)

	 - route: /[x's tablename]

	 - request body: X object

		Notes: list attributes will be ignored by the generic update route and will have their own special update route

	 - response: X object

	deleteXById (HTTP DELETE)

	 - route: /[x's tablename]

	 - request body: none

	 - response: X object


special routes

customer routes:

	getCustomerByUsername (HTTP GET)

	 - route: /customers/getByUsername/[username]

	 - request body fields: none

	 - response: Customer

	getCustomersByShopId (HTTP GET)

	 - route: /customers/shopId/[id]

	 - request body fields: none

	 - response: Customer[]

	updateCustomerCart (HTTP PUT)

	 - route: /customers/[id]/cart

	 - request body fields: 

	 	productIds: string

	 - response: object with fields

	 	customerId: number

		productIds: number[]

	updateCustomerCards (HTTP PUT)

	 - route: /customers/[id]/cardInfoIds

	 - request body fields: 

	 	cardInfoIds: number[]

	 - response: object with fields

	 	customerId: number

		cardInfoIds: number[]

	updateCustomerDiscounts (HTTP PUT)

	 - route: /customers/[id]/discountIds

	 - request body fields: 

	 	discountIds: string

	 - response: object with fields

	 	customerId: number

		discountIds: number[]


businessOwner routes:

	getBusinessOwnerByUsername (HTTP GET)

	 - route: /businessOwners/getByUsername/[username]

	 - request body fields: none

	 - response: BusinessOwner


card routes:

	no special card routes, see universal routes

discount routes:

	updateDiscountProducts (HTTP PUT)

	 - route: /discounts/[id]/productIds

	 - request body fields:

	 	productIds: number[]

	 - response:

	 	discountId: number

		productIds: number[]


product routes:

	getProductsByTransactionId (HTTP GET)

	 - route: /products/transactionId/[id]

	 - request body: none

	 - response: Product[]

	getProductsByShopId (HTTP GET)

	 - route: /products/shopId/[id]

	 - request body: none

	 - response: Product[]

	getProductsByTagId (HTTP GET)

	 - route: /products/tagId/[id]

	 - request body: none

	 - response: Product[]

	getProductsByIdList (HTTP PUT)

	 - route: /products/getByIdList

	 - request body fields:

		productIds: number[]

	 - response: Product[]

	updateProductTags (HTTP PUT)

	 - route: /products/[id]/tagIds

	 - request body fields:

	 	tagIds: number[]

	 - response:

	 	productId: number

		tagIds: number[]
	
	updateProductReviews (HTTP PUT)
	 
	 - route: /products/[id]/reviews

	 - request body fields:

	 	reviews: string[]

	 - response:
	 	
		productId: number

		reviews: string[]



shop routes:

	no special shop routes, see universal routes


tag routes:

	getTagsByShopId (HTTP GET)

	 - route: /tags/shopId/[id]

	 - request body: none

	 - response: Tag[]

	getTagsByProductId (HTTP GET)

	 - route: /tags/productId/[id]

	 - request body: none

	 - response: Tag[]

	updateTagProducts (HTTP PUT)

	 - route: /tags/[id]/productIds

	 - request body fields:

	 	productIds: number[]

	 - response:

	 	tagId: number

		productIds: number[]


transaction routes:

	getTransactionsByShopId (HTTP GET)

	 - route: /transactions/shopId/[id]

	 - request body: none

	 - response: Transaction[]

	getTransactionsByProductId (HTTP GET)

	 - route: /transactions/productId/[id]

	 - request body: none

	 - response: Transaction[]

	getTransactionsByCustomerId (HTTP GET)

	 - route: /transactions/customerId/[id]

	 - request body: none

	 - response: Transaction[]



authenticate routes:

	authenticateCustomer (HTTP POST)

	 - route: /authenticate/customer/[username]

	 - request body fields:

	 	password: string

	 - response fields:

	 	valid: boolean

	authenticateBusinessOwner (HTTP POST)

	 - route: /authenticate/businessOwner/[username]

	 - request body fields:

	 	password: string

	 - response fields:

	 	valid: boolean


usernameExists routes:

	usernameExists (HTTP GET)

	 - route: /usernameExists/[username]

	 - request body: none

	 - response fields:

	 	exists: boolean


image routes:

	getImage (HTTP GET)
	 
	 - route: /images/[imageUrl]
	 
	 - request body: none
	 
	 - response: image file

	getAllImageFilenames (HTTP GET)
	 
	 - route: /images

	 - request body: none

	 - response: string[]

	uploadImage (HTTP PUT)
	 
	 - route: /images/[imageUrl]

	 - request body: image file

	 - response: confirmation string