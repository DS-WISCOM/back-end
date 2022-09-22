const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const commentSchema = mongoose.Schema({ 
  project_id: {  // 댓글이 작성된 프로젝트 id(FK)
    type: Schema.Types.ObjectId,
    ref: 'Project',
    require: true
  },
  writer: { // 작성자
    type: String,
  },
  content: { // 내용
    type: String
  }
}, {timestamps : true})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = { Comment }