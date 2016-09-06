
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthNumSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    authNum: String,
    active: {
        type: Boolean,
        default: true
    }
});

// {
//     capped : { size : 1000000, max : 1000, autoIndexId : true }
// }
// 총데이터가 1,000개를 넘어갈 수 없음, 자동 index

mongoose.model('AuthNum', AuthNumSchema);