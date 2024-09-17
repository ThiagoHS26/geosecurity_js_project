import mongoose from "mongoose";
const { Schema } = mongoose;

const criminalCasesSchema = new Schema({
    type: { 
        type: String, 
        required: true 
    },
    location :{
        type: {
            type: String,
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    date :{
        type: Date,
        required: true
    },
    description :{
        type: String,
        required: false
    }
});

criminalCasesSchema.index({location: '2dsphere'});

const CriminalCase = mongoose.model('CriminalCase', criminalCasesSchema);

export default CriminalCase;