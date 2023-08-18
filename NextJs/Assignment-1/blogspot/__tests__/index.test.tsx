import BlogData from "@/pages/blog/[blog]";
import Blogs from "../pages/blog/index";
import { getAllBlogs, getSingleBlog, mockLoginApi } from "@/utils/blogFetcher";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import {
  addBlogToReadingList,
  getReadingListData,
  openDB,
  removeBlogFromList,
} from "@/utils/indexDB";
import Login from "@/pages/signin";
import Header from "@/components/Header/Header";
require("fake-indexeddb/auto");

jest.mock("next-auth/react");
jest.mock("next/router", () => require("next-router-mock"));
(useSession as jest.Mock).mockReturnValue({
  data: {
    user: {
      name: null,
    },
  },
  status: "loading",
});
describe("Blog main Page", () => {
  it("should be able list all the blogs", async () => {
    let data = await getAllBlogs();
    const { container } = render(<Blogs blogs={data} />);
    expect(container).toMatchSnapshot();
  });
});

describe("Blog page", () => {
  it("should be able to show single blog on the page", async () => {
    const data = await getSingleBlog(
      "your-go-to-chatbot-guide-101-all-you-need-to-know-about-chatbots"
    );
    const { container } = render(<BlogData blogData={data} />);
    expect(container).toBeInTheDocument();
  });
});

describe("Index DB", () => {
  it("should be able to access", async () => {
    const conn = await openDB();
    expect(conn).not.toBeNull();
  });

  it("user should be able to add blog in indexDB", async () => {
    const data = await addBlogToReadingList(
      "your-go-to-chatbot-guide-101-all-you-need-to-know-about-chatbots",
      123
    );
    expect(data).toEqual(1);
  });

  it("should get all blog data", async () => {
    const data = await getReadingListData();
    expect(data).not.toBeNull();
  });

  it("user should be able to delete blog from indexDB", async () => {
    const data = await removeBlogFromList(1);
    expect(data).toEqual("done");
  });
});

beforeEach(async () => {
  const user = await mockLoginApi();
  if (!user || user.message) {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "null",
        },
      },
      status: "unauthenticated",
    });
  } else {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user,
      },
      status: "authenticated",
    });
  }
});

describe("Authentication", () => {
  it("User should be able to sign in", async () => {
    render(<Header />);

    const name = screen.getByTestId("name");
    expect(name.innerHTML).toBe("Vatsal");
  });

  // it("should be able to get user name after login", async () => {
  //   const { getByText, container } = render(<Header />);
  //   expect(container).toMatchSnapshot();
  // });
});
