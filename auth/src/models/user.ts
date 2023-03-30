import mongoose from 'mongoose';
import { Password } from '../services/password';

/**
 * An interface that defines the properties that are required to create new user
 */
interface UserAttrs {
	email: string;
	password: string;
}

/**
 * This interface will tell typescript about the build method that user have
 * UserModel will have all the properties of mongoose model.
 * And we can add new properties also.
 * Then we can just use userModel instead of mongoose model
 * In place of <UserDoc> prev it was <any>. As you can see both have same email and password
 * But both interface are different as UserDoc extends mongoos document.
 * Also some properties that is in mongoDB like time that we can write in UserDoc but not in UserAttrs
 * As UserAttrs is for frontend request
 */
interface UserModel extends mongoose.Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

/**
 * This intedface required how a user document looks like
 * In other words this are the properties that we are not serving in TS by user.
 * But are being added by mongoose.
 * Using UserDoc this is possible -> User.email || User.password
 */
interface UserDoc extends mongoose.Document {
	email: string;
	password: string;
}

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.password;
				delete ret.__v;
			},
		},
	}
);

/**
 * This pre hook will run when we call await user.save();
 */
userSchema.pre('save', async function (done) {
	/**
	 * isModified will return true
	 * * If new user is being created
	 * * If password is changed
	 * it will return false when
	 * * Password is not changed and is already hashed
	 */
	if (this.isModified('password')) {
		const hashed = await Password.toHash(this.get('password'));
		this.set('password', hashed);
	}
	done();
});

/**
 * Basically what build is doing is when we send some data to be stored
 * It will check if it is of type UserAttrs and then only it will accept or it will give error
 * Then we will pass the attrs data to create new user
 * This will inclide build in userSchema. Now no need of exporting new function.
 */
userSchema.statics.build = (attrs: UserAttrs) => {
	return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
