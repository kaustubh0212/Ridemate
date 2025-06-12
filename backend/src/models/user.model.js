import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt" 
import jwt from "jsonwebtoken"


const userSchema =  new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
        },


        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, // cloudanary URL: uploadingavatar on a third party site which will store it and return a URLto backend
            required: true,
        },

        /*
        watchHistory:  // Array
        [
            {
                type: Schema.Types.ObjectId,  // Holds the unique ID of a video.
                ref: "Video"  // Tells MongoDB that "Video" is a schema model where all videos (with their IDs) are stored.
            }
        ],
        */

        password: {
            type: String,
            required: [true, 'Password id required']
        },

        refreshToken: {
            type: String,
        }

}, {timestamps: true})


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)