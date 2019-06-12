"""Models and database functions for lost and found final project"""

#import SQLAlchemy
from flask_sqlalchemy import SQLAlchemy

#connection to PostgreSQL database
db = SQLAlchemy()


#Users model
class User(db.Model):
    """User information"""

    __tablename__ = "users"


    #create columns
    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String(64), nullable=False)
    password = db.Column(db.String(64), nullable=False)
    fname = db.Column(db.String(100), nullable=False)
    lname = db.Column(db.String(100), nullable=True)

    #define how data will print
    def __repr__(self): 
        """ Provide helpful representation when printed """

        return f"""<User user_id = {self.user_id} email = {self.email}>"""

    def to_dict(self):
        """returns a dictionary representation of the instance"""
        user_dict = {
            'user_id': self.user_id,
            'email': self.email,
            'password': self.password,
            'fname': self.fname,
            'lname': self.lname
        }

        return user_dict;



#location model
class Location(db.Model):
    """Information about locaions"""

    __tablename__ = "locations"


    #create columns
    location_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    title = db.Column(db.String(100), nullable=True)
    address1 = db.Column(db.String(100), nullable=True)
    address2 = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    zipcode = db.Column(db.String(50), nullable=True)
    state = db.Column(db.String(10), nullable=True)
    lat = db.Column(db.Float, nullable=True) 
    lng = db.Column(db.Float, nullable=True)

    def to_dict(self):
        """converts Location object to dict"""
        location_dict = {'location_id': self.location_id,
                         'title': self.title,
                         'address1': self.address1,
                         'address2': self.address2,
                         'city': self.city,
                         'zipcode': self.zipcode,
                         'state': self.state,
                         'lat': self.lat,
                         'lng': self.lng}

        return location_dict

    
class Found(db.Model):
    """Information about found items"""

    __tablename__ = "founds"


    #create columns
    found_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    location_id = db.Column(db.Integer, db.ForeignKey("locations.location_id"))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    time = db.Column(db.DateTime, nullable=False)
    
    #define relationship to user
    user = db.relationship("User",
                            backref=db.backref("founds",
                                                order_by=found_id))

    #define relationship to location
    location = db.relationship("Location",
                            backref=db.backref("founds",
                                                order_by=found_id))


    def to_dict(self):
        """converts Found object to dict"""

        found_dict = {'found_id': self.found_id,
                      'user_id': self.user_id,
                      'title': self.title,
                      'location_id': self.location_id,
                      'description': self.description,
                      'time': self.time}

        return found_dict


class Lost(db.Model):
    """Information about lost items"""

    __tablename__ = "losts"


    #create columns
    lost_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    location_id = db.Column(db.Integer, db.ForeignKey("locations.location_id"))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    reward = db.Column(db.Float(), nullable=True)
    time = db.Column(db.DateTime, nullable=False)

    #define relationship to user
    user = db.relationship("User",
                            backref=db.backref("losts",
                                                order_by=lost_id))

    #define relationship to location
    location = db.relationship("Location",
                            backref=db.backref("losts",
                                                order_by=lost_id))

    def to_dict(self):
        """converts Lost object to dict"""

        lost_dict = {'lost_id': self.lost_id,
                      'user_id': self.user_id,
                      'title': self.title,
                      'location_id': self.location_id,
                      'description': self.description,
                      'time': self.time}

        return lost_dict


class Image(db.Model):
    """Images related to lost and found items"""

    __tablename__ = "images"

    img_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    img_name = db.Column(db.String(300), nullable=False)
    img_data = db.Column(db.LargeBinary, nullable=False)
    found_id = db.Column(db.Integer, db.ForeignKey("founds.found_id"), nullable=True)
    lost_id = db.Column(db.Integer, db.ForeignKey("losts.lost_id"), nullable=True)

    #define relationship to found
    found = db.relationship("Found",
                            backref=db.backref("images",
                                                order_by=img_id))

    #define relationship to lost
    lost = db.relationship("Lost",
                            backref=db.backref("images",
                                                order_by=img_id))

     #define how data will print
    def __repr__(self): 
        """ Provide helpful representation when printed """

        return f"<Image img_id = {self.img_id} name = {self.img_name} found_id = {self.found_id} lost_id = {self.lost_id}>"

class Message(db.Model):
    """user messages"""

    __tablename__ = "messages"

    msg_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    from_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    to_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    body = db.Column(db.String(500), nullable=False)
    read = db.Column(db.Boolean, nullable=False)
    send_time = db.Column(db.DateTime, nullable=False)


    from_user = db.relationship("User", foreign_keys=from_id)
    to_user = db.relationship("User", foreign_keys=to_id)

    # #define relationship to user
    # to_user = db.relationship("User",
    #                         backref=db.backref("messages",
    #                                             order_by=to_id))

    # #define relationship to user
    # from_user = db.relationship("User",
    #                         backref=db.backref("messages",
    #                                             order_by=from_id))

      #define how data will print
    def __repr__(self):
        """Provide helpful representation when printed."""

        return f"""<Message msg_id={self.msg_id}
                   from_id={self.from_id}
                   to_id={self.to_id}
                   subject={self.subject}
                   read={self.read}>"""

    def to_dict(self):
        """converts Message object to dict"""

        msg_dict = {'msg_id': self.msg_id,
                      'from_id': self.from_id,
                      'to_id': self.to_id,
                      'subject': self.subject,
                      'body': self.body,
                      'read': self.read,
                      'send_time': self.send_time}

        return msg_dict

##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PstgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///items'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print("Connected to DB.")
