const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")
const ObjectId = require('mongoose').Types.ObjectId;


const isValid = function (value) {
    if (typeof value == null) return false; //Here it Checks that Is there value is null or undefined  " " 
    if (typeof value === "string" && value.trim().length === 0) return false; // Here it Checks that Value contain only Space
    return true;
};


const createReview = async function (req, res) {
    try {
        let reviewsData = req.body
        let { bookId } = req.params
        let { reviewedBy, reviewedAt, rating, review  , isDeleted} = req.body

        if (!Object.keys(reviewsData).length) {
            return res.status(400).send({ status: false, msg: "Please enter the review Details" });
        }
        // check rating is present or not
        if (!rating) {
            return res.status(400).send({ status: false, msg: "please provide rating " })
        }
        //check if isDeleted is TRUE/FALSE ?
        if (isDeleted && (!(typeof isDeleted === "boolean"))) {
            return res.status(400).send({ status: false, msg: "isDeleted Must be TRUE OR FALSE" });
        }
        //  if isDeleted is true add the current Time&Date in deletedAt?
        if (isDeleted) {
            bookData.deletedAt = new Date()
        }

        // if releasedAt  add the current Time&Date in releasedAt?
        if (reviewedAt) {
            reviewsData.reviewedAt = Date.now()
        }

        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Book Id is Invalid !!!!" })

        if (!isValid(reviewedBy)) return res.status(400).send({ status: false, message: " Plz enter Valid reviewedBY" })

        // check bookId present or not
        let findBooks = await bookModel.findById(bookId)
        if (!findBooks) {
            return res.status(400).send({ status: false, msg: "bookId is Already Present in DB" })
        }

        // check bookId valid or not

        let findBook = await bookModel.findOne({ bookId: bookId, isDeleted: false })
        if (!findBook) return res.status(404).send({ status: false, message: "No such Book is Present as Per BookID" })

        if (!isValid(reviewedBy)) return res.status(400).send({ status: false, message: " Plz enter Valid reviewedBY" })

        // check rating between 1-5
        if (!(reviewsData.rating >= 1 && reviewsData.rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating must be in between 1 to 5." })
        }

        req.body.bookId = bookId.toString()

        // if all condition are passed then data will be create
        const reviewData = await reviewModel.create(req.body)
        
        let updatedBook = await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: 1  } }, { new: true }).lean()

        updatedBook.reviewData = reviewData

        return res.status(201).send({ status: true, message: "Success", data: updatedBook })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


const updateReview = async function (req, res) {
    try {
        let reviewId = req.params.reviewId
        let bookId = req.params.bookId
        let data = req.body
        let { review, rating, reviewedBy, reviewedAt,isDeleted , ...rest} = req.body

        if (Object.keys(rest).length > 0) {
            return res.status(400).send({ status: false, msg: "Please provide suggested key  ex : review, rating, reviewedBy" })
        }

        //check the review Id is Valid or Not ?
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: "reviewId is Invalid" });
        }

        //check if id is present in Db or Not ? 
        let findReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false,})
        if (!findReview) return res.status(404).send({ status: false, msg: "reviewId is not present in DB" })    

        //check if the data in request body is present or not ?
        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, msg: "Noting to Update Request from Body" });
        }

        if (!bookId) return res.status(400).send({ status: false, msg: "bookId must be present" });
           
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId not valid" });
        }
        // check if id is present in Db or Not ? 
        let findBooks = await bookModel.findOne({_id: bookId}).lean()
        if (!findBooks) return res.status(404).send({ status: false, msg: "bookId is not match " })

        //check if isDeleted is TRUE/FALSE ?
        if (isDeleted && (!(typeof isDeleted === "boolean"))) {
            return res.status(400).send({ status: false, msg: "isDeleted Must be TRUE OR FALSE" });
        }

        // check if isDeleated Status is True
        if (findBooks.isDeleted) return res.status(404).send({ status: false, msg: "book is Already Deleted" })

        // if releasedAt  add the current Time&Date in releasedAt?
        if (reviewedAt) {
            data.reviewedAt = Date.now()
        }

        var regEx = /^[a-zA-Z ]{2,100}$/
        // check it is valid name or not? (using regular expression)
        if (!regEx.test(reviewedBy)) {
            return res.status(400).send({ status: false, msg: " name is invalid , name must be 2 digits " });
        }
        // check rating between 1-5
        if (!data.rating ) {
            return res.status(400).send({ status: false, message: "please providing a rating" })
        }
        if (!(data.rating >= 1 && data.rating <= 5)) {
            return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
        }
        // check it is valid review or not? (using regular expression)
        if (!regEx.test(review)) {
            return res.status(400).send({ status: false, msg: "review text is invalid" });
        }

        let updateReview = await reviewModel.findByIdAndUpdate({_id: reviewId, bookId: bookId, isDeleted: false },data,{ new: true })
        if (!updateReview) return res.status(404).send({ status: false, message: "This Review is Not Belongs to This Book!!!" });

        findBooks.reviewData=updateReview;

        return res.status(200).send({ status: true, message: "Successfully Update review", data: findBooks });

        // return res.status(200).send({ status: true, data: updateReview });

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


// *******************************deleteReview by id**************************************

const deletedReview = async function (req, res) {
    try {
    
    let reviewId = req.params.reviewId;
        let bookId = req.params.bookId;

        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "Review Id is Invalid !!!!" })
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Book Id is Invalid !!!!" })


        const findReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false, }); //check id exist in review model
        if (!findReview) return res.status(404).send({ status: false, message: 'Review not exist as per review Id in URL' });


        //bookId exist in our database
        const findBook = await bookModel.findOne({ _id: bookId, isDeleted: false }); //check id exist in book model
        if (!findBook) return res.status(404).send({ status: false, message: "Book Not Exist as per bookId in url" });

        const deleteReview = await reviewModel.findOneAndUpdate(
            { _id: reviewId, bookId: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!deleteReview) return res.status(404).send({ status: false, message: "This Review is Not Belongs to This Book!!!" });

        await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: -1 } })
        return res.status(200).send({ status: true, message: "Successfully deleted review", data: deleteReview, });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}





module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deletedReview=deletedReview
