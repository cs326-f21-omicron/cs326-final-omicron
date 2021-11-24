# _HobbShop_

[Github Repo](https://github.com/cs326-f21-omicron/cs326-final-omicron)

# Team Omicron

- Hung Do ([hungmhdo](https://github.com/hungmhdo))
- Luke Nguyen ([lukednguyen](https://github.com/lukednguyen))
- Kirk Smalley ([kjsmalley](https://github.com/kjsmalley))

# Division of labor

| Part                     | Hung Do | Luke Nguyen | Kirk Smalley |
| ------------------------ | ------- | ----------- | ------------ |
| Sign up                  | Primary |             |              |
| Login                    | Primary |             |              |
| Homepage/Recommendations | Primary |             |              |
| Create new post          | Primary |             |              |
| View post                | Primary |             |              |
| View post by category    | Primary |             |              |

# Database description

### userData

Description: This table stores all the user information: username, password, categories.

| Column Name | Type           | Description                                         |
| ----------- | -------------- | --------------------------------------------------- |
| id          | String         | primary key                                         |
| username    | String         | username of the user                                |
| password    | String         | password of the user                                |
| categories  | Array of DBRef | refer to the categories that the user interested in |

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
