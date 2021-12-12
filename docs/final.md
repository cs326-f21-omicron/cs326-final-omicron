# Team Omicron - Fall 2021

## Project name: _HobbShop_

[Github Repo](https://github.com/cs326-f21-omicron/cs326-final-omicron)

[Heroku link](https://cs326-f21-omicron-final.herokuapp.com/login)

## Overview

> HobbShop is a website that brings people with the same hobbies and interest closer together. HobbShop allows users to create an account to share their hobbies and interests with other users through images. Users can also search for other users with similar hobbies and interests and chat with them.

## Team members

-   Hung Do ([hungmhdo](https://github.com/hungmhdo))
-   Luke Nguyen ([lukednguyen](https://github.com/lukednguyen))
-   Kirk Smalley ([kjsmalley](https://github.com/kjsmalley))

## User Interface

| Component      | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| _Landing Page_ | The landing page of the website.                              |
| _Login_        | Login page of the website where user can login                |
| _Signup_       | Signup page of the website where user can signup              |
| _Home_         | Show all of the posts that the user is interested in          |
| _Category_     | Show all post in this category                                |
| _New Post_     | New post page of the website where user can create a new post |
| _View Post_    | View post page of the website where user can view a post      |
| _Edit Post_    | Edit post page of the website where user can edit a post      |
| _Messages_     | For users to communicate                                      |

## APIs

| Method | API                     | Description                           | Parameters                                                                                  | Authenticate |
| ------ | ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| POST   | /login                  | User log in                           | String username, String password                                                            | Not required |
| POST   | /signup                 | User sign up                          | String username, String password, String name                                               | Not required |
| GET    | /logout                 | User log out                          |                                                                                             | Not required |
| POST   | /newpost                | Create a new post                     | String title, String description, String category, String image, String location            | Required     |
| GET    | /categories             | Get all categories name               |                                                                                             | Required     |
| GET    | /posts                  | Get all posts or get post by category | String id                                                                                   | Required     |
| PUT    | /posts                  | Update a post                         | String id, String title, String description, String category, String image, String location | Required     |
| DELETE | /posts                  | Delete a post                         | String id                                                                                   | Required     |
| POST   | /rooms                  | Create a new room given post ID       | String postId                                                                               | Required     |
| GET    | /rooms/:roomId          | Get from info from room ID            | None                                                                                        | Required     |
| GET    | /posts/:postId/room     | Get from info from post ID            | None                                                                                        | Required     |
| GET    | /rooms/:roomId/messages | Get messages in room from room ID     | None                                                                                        | Required     |
| POST   | /rooms/:roomId/message  | Create new message                    | String userId, String content                                                               | Required     |

## Database

### userData

Description: This table stores all the user information: username, password, categories.

| Column Name | Type           | Description                                         |
| ----------- | -------------- | --------------------------------------------------- |
| id          | String         | primary key                                         |
| username    | String         | username of the user                                |
| password    | String         | password of the user                                |
| categories  | Array of DBRef | refer to the categories that the user interested in |
| name        | String         | name of the user                                    |

### categories

Description: This table stores all the categories.

| Column Name | Type   | Description           |
| ----------- | ------ | --------------------- |
| id          | String | primary key           |
| title       | String | title of the category |

### posts

Description: This table stores all the posts.

| Column Name | Type   | Description                        |
| ----------- | ------ | ---------------------------------- |
| id          | String | primary key                        |
| title       | String | title of the post                  |
| date        | String | date of the post                   |
| location    | String | location of the post               |
| image       | String | link or base64 string of the image |
| description | String | description of the post            |
| category    | DBRef  | refer to the category              |
| user        | DBRef  | refer to the user                  |

### messages

Description: Stores all chat messages

| Column Name | Type     | Description                            |
| ----------- | -------- | -------------------------------------- |
| \_id        | ObjectId | primary key                            |
| content     | String   | content of the message                 |
| user        | ObjectId | user id of the author                  |
| room        | ObjectId | id of the room this message belongs to |
| createdAt   | Double   | time created stored as an epoch        |

### rooms

Description: Chat room

| Column Name | Type              | Description                   |
| ----------- | ----------------- | ----------------------------- |
| \_id        | ObjectId          | primary key                   |
| messages    | Array\<ObjectId\> | array of all messages         |
| postId      | ObjectId          | the post related to this room |

## URL Routes/Mapping

| URL       | Page       |
| --------- | ---------- |
| /         | LadingPage |
| /login    | Login      |
| /signup   | Signup     |
| /home     | Home       |
| /newpost  | NewPost    |
| /post     | ViewPost   |
| /editpost | EditPost   |
| /messages | Messages   |

## Authentication/Authorization

| Page        | Authentication | Redirect on Auth / UnAuth |
| ----------- | -------------- | ------------------------- |
| LandingPage | Not required   | Authorized: Home          |
| Login       | Not required   | Authorized: Home          |
| Signup      | Not required   | Authorized: Home          |
| Home        | Required       | Unauthorized: Log In      |
| NewPost     | Required       | Unauthorized: Log In      |
| ViewPost    | Required       | Unauthorized: Log In      |
| EditPost    | Required       | Unauthorized: Log In      |
| Messages    | Required       | Unauthorized: Log In      |

## Division of labor

| Part                     | Hung Do | Luke Nguyen  | Kirk Smalley |
| ------------------------ | ------- | ------------ | ------------ |
| Sign up                  | Primary |              |              |
| Login                    | Primary |              |              |
| Homepage/Recommendations | Primary |              |              |
| Create new post          | Primary |              |              |
| Edit and delete post     | Primary |              |              |
| View post                | Primary |              |              |
| View post by category    | Primary |              |              |
| UserID's storage         |         |              | Primary      |
| UserInfo Read/Update     |         |              | Primary      |
| Messages                 |         | Primary      |              |
| Heroku/Github config     |         | Primary      |              |
| Project cleanup          |         | Participated |              |

## Conclusion

Luke: In my opinion, working with pure HTML, CSS, and client-side JS is way more difficult than it needed to be. It's very hard to share a component between sites, while dynamically loading data is equally hard.
Hung: I think the most difficult part is to make the website responsive. I think working HTML, CSS, and JS is easier than I expected.
