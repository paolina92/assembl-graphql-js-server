import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = `
type SentimentCounts {
  like: Int
  disagree: Int
  dont_understand: Int
  more_info: Int
}

type AgentProfile {
  id: ID!
  name: String
}

#type User extends AgentProfile {
#  email: String!
#}

type Video {
  title(lang: String): String
  description(lang: String): String
  htmlCode: String
}

interface PostInterface {
  id: ID!
  creationDate: String #DateTime
  creator: AgentProfile
  subject(lang: String): String
  body(lang: String): String
  sentimentCounts: SentimentCounts
  replies: [Post]
}

type AssemblPost implements PostInterface {
  id: ID!
  creationDate: String #DateTime
  creator: AgentProfile
  subject(lang: String): String
  body(lang: String): String
  sentimentCounts: SentimentCounts
  replies: [Post]
}

type Proposition implements PostInterface {
  id: ID!
  creationDate: String #DateTime
  creator: AgentProfile
  subject(lang: String): String  # not used for proposition, auto-filled with Re: question?
  body(lang: String): String  #  not used by question
  sentimentCounts: SentimentCounts
  replies: [Post]
}

union Post = AssemblPost | Proposition

interface IdeaInterface {
  id: ID!
  description: String
  title(lang: String): String
  numPosts: Int
  posts: [Post]
  ideas: [IdeaTypes]
}

type Idea implements IdeaInterface {
  id: ID!
  description: String
  title(lang: String): String
  numPosts: Int
  posts: [Post]
  ideas: [IdeaTypes]
}

type Thematic implements IdeaInterface {
  id: ID!
  description: String
  title(lang: String): String
  numPosts: Int  # sum of posts of all questions
  posts: [Post]  # not used
  ideas: [IdeaTypes]  # this is the questions
  localizedTitle(lang: String): String  # title field from idea table is not a langstring, this is why we add localizedTitle field in thematic table which is a langstring
  video: Video
}

type Question implements IdeaInterface {
  id: ID!
  description: String
  title(lang: String): String
  numPosts: Int
  posts: [Post]
  ideas: [IdeaTypes] # not used
  localizedTitle(lang: String): String
}

union IdeaTypes = Idea | Thematic | Question

# the schema allows the following query:
type Query {
  posts(discussionId: ID, ideaId: ID, offset: Int, limit: Int): [Post]
  ideas(discussionId: ID, ideaType: IdeaType, offset: Int, limit: Int): [IdeaTypes]
}

# Type of sentiment
enum SentimentType {
  LIKE
  DISAGREE
  DONT_UNDERSTAND
  MORE_INFO
}

# Type of idea
enum IdeaType {
  IDEA
  ROOT_IDEA
  THEMATIC
  QUESTION
}

# Type of post
enum PostType {
  ASSEMBL_POST
  PROPOSITION
}

# this schema allows the following mutation:
type Mutation {
  addSentiment(
    postId: Int!
    type: SentimentType!
  ): SentimentCounts!
  createIdea(
    discussionId: ID!
    parentId: ID,
    type: IdeaType!
    title: String!
  ): Idea!
  createPost(
    discussionId: ID!
    ideaId: ID
    parentId: ID,
    type: PostType!,
    subject: String,
    body: String!
  ): Post!
}

schema {
  query: Query
  mutation: Mutation
}
`;

export default makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});
