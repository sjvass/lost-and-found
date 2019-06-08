"""Utility file to seed items database with random data"""

from sqlalchemy import func
from model import User, Location, Found, Lost, Image, Message

from model import connect_to_db, db
from server import app

from datetime import datetime

from random import randint, uniform

def load_users():
    """Populates users with 5 random users"""

    print("Users")

    # Delete all rows in table, so if we need to run this a second time,
    # we won't be trying to add duplicate users
    #need to delete rating db also because it has forigen keys from users
    Found.query.delete()
    Lost.query.delete()
    Message.query.delete()
    User.query.delete()

    # Read u.user file and insert data
    for row in open("example_data/u.user"):
        row = row.rstrip()
        email, password, fname, lname = row.split("|")

        user = User(email=email,
                    password=password,
                    fname=fname,
                    lname=lname)

        # We need to add to the session or it won't ever be stored
        db.session.add(user)

    # Once we're done, we should commit our work
    db.session.commit()



def load_locations():
    """Populates locations with loactions from ex.locations"""

    print("Locations")

    # Delete all rows in table, so if we need to run this a second time,
    # we won't be trying to add duplicate users
    #need to delete rating db also because it has forigen keys from users
    Found.query.delete()
    Lost.query.delete()
    Location.query.delete()

    # Read ex.Location file and insert data
    for row in open("example_data/ex.location"):
        row = row.rstrip()
        title, address1, address2, city, state, zipcode, lat, lng = row.split("|")


        location = Location(title=title,
            address1=address1,
            address2=address2,
            city=city,
            state=state,
            zipcode=zipcode)

        # We need to add to the session or it won't ever be stored
        db.session.add(location)

    # Once we're done, we should commit our work
    db.session.commit()


def load_founds():
    """populates founds with 5 random founds"""

    print("Founds")

    Found.query.delete()

    #get all users sorted by user_id in decending order
    users = User.query.order_by(User.user_id.desc()).all()
    #get all locationssorted by user_id in decending order
    locations = Location.query.order_by(Location.location_id.desc()).all()

    #get min and max user_id
    max_uid = users[0].user_id
    min_uid = users[-1].user_id

    #get min and max loaction_id
    max_lid = locations[0].location_id
    min_lid = locations[-1].location_id

    items = [("Purple Water Bottle", "I found a purple Camelback waterbottle at Chrisy Field. It has a dent in the right side and a Github sticker on it."),
                ("Golden State Worriors Hat", "found a Golden State Warriors with the name John Smith written on the inside"),
                ("Raincoat", "Purple Raincoat with white polka-dots. Womens size small"),
                ("Pink Wallet", "ID says it belongs to Jane Doe. There was no money in it, only a Subway giftcard."),
                ("iPhone", "iPhone 6S")]
    

    for i in range(5):
        found = Found(user_id=randint(min_uid, max_uid),
            location_id=randint(min_lid, max_lid),
            title=items[i][0],
            description=items[i][1],
            time=datetime.now())

        db.session.add(found)

    db.session.commit()


def load_losts():
    """populates losts with 5 random losts"""

    print("Losts")

    Lost.query.delete()

    #get all users sorted by user_id in decending order
    users = User.query.order_by(User.user_id.desc()).all()
    #get all locationssorted by user_id in decending order
    locations = Location.query.order_by(Location.location_id.desc()).all()

    #get min and max user_id
    max_uid = users[0].user_id
    min_uid = users[-1].user_id

    #get min and max location_id
    max_lid = locations[0].location_id
    min_lid = locations[-1].location_id

    items = [("Blue Sweater", "I lost my blue hoodie in Golden Gate Park. It has a unicorn on the back"),
                ("Left Shoe", "I lost my left Addidas slide at Ocean Beach."),
                ("Earring", "I lost my golden hoop earring at City Lights bookstore"),
                ("Pink Wallet", "ID says it belongs to Jane Doe."),
                ("iPhone", "iPhone 6S")]
    

    for i in range(5):
        lost = Lost(user_id=randint(min_uid, max_uid),
            location_id=randint(min_lid, max_lid),
            title=items[i][0],
            description=items[i][1],
            time=datetime.now(),
            reward=uniform(0, 100))

        db.session.add(lost)

    db.session.commit()



def load_messages():
    """generate 5 sample messages"""

    Message.query.delete()

    print("Messages")

    #get all users sorted by user_id in decending order
    users = User.query.order_by(User.user_id.desc()).all()

    #get min and max user_id
    max_uid = users[0].user_id
    min_uid = users[-1].user_id 

    messages = [("Re: Blue Sweater", "I think I found your blue sweater"), 
                ("Re: iPhone", "Does the iPhone you found have a pink case?"),
                ("Re: Pink Wallet", "That's my wallet! Is there a place and time you can meet to return it?"),
                ("Re: Raincoat", "Does it have a muni transfer in the pocket?"),
                ("Re: Left Shoe", "I found a shoe matching that description. I brought it to the guard building.")]


    for i in range(5):
        msg = Message(from_id=randint(min_uid, max_uid),
            to_id=randint(min_uid, max_uid),
            subject=messages[i][0],
            body=messages[i][1],
            send_time=datetime.now(),
            read=False)

        db.session.add(msg)

    db.session.commit()

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_users()
    load_locations()
    load_founds()
    load_losts()
    load_messages()