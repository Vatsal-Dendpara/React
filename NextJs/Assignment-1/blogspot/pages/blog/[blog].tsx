import { getAllBlogs, getSingleBlog } from "@/utils/blogFetcher";

import { useSession } from "next-auth/react";
import {
  addBlogToReadingList,
  getBlogBasedOnUserId,
  removeBlogFromList,
} from "@/utils/indexDB";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BlogPage from "@/components/BlogPage/BlogPage";
import Head from "next/head";
import { toast } from "react-toastify";

type blogData = {
  title: string;
  _id: string;
  slug: {
    current: string;
    _type: string;
  };
  mainImage: {
    asset: {
      _id: string;
      url: string;
    };
  };
  categories: [
    {
      title: string;
    }
  ];
  body: [];
  author: {
    name: string;
    image: {
      asset: {
        url: string;
      };
    };
  };
};

const BlogData = (blog: { blogData: blogData[] }) => {
  const { data: session }: any = useSession();

  const [isBookmark, setIsBookmark] = useState<any>(false);
  const [bookmark, setBookmark] = useState<any>([]);
  const [userSlugs, setUserSlugs] = useState<any>([]);

  useEffect(() => {
    const isThisBookmarkedBlog = async () => {
      const data = await getBlogBasedOnUserId(session?.user?.id);
      setBookmark(data);
      const isBlogBookmarked = data.map((d: any) => d.slug);
      setUserSlugs(isBlogBookmarked);
      if (isBlogBookmarked.includes(router.query.blog)) {
        setIsBookmark(true);
      }
    };
    isThisBookmarkedBlog();
  }, [isBookmark, userSlugs]);

  const { blogData } = blog;
  const router = useRouter();

  const addToReadingList = async (slug: string) => {
    if (userSlugs.length >= 5) {
      toast("You cannot add more than 5 blogs to bookmark", {
        hideProgressBar: true,
        autoClose: 4000,
        type: "error",
      });
    } else {
      await addBlogToReadingList(slug, session.user.id);
      setUserSlugs((prev: any) => [...prev, slug]);
      setIsBookmark(true);
    }
  };

  const removeFromReadingList = async (slug: string) => {
    const id = bookmark.find((d: any) => d.slug === slug);
    const remove = await removeBlogFromList(id?.id);
    console.log(remove);
    const data = userSlugs.filter((d: any) => d !== slug);
    setUserSlugs(data);
    setIsBookmark(false);
  };
  return (
    <>
      <Head>
        <title>{blogData[0].title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Blogging Website" />
      </Head>
      <BlogPage
        blogData={blogData}
        session={session}
        isBookmark={isBookmark}
        addToReadingList={addToReadingList}
        removeFromReadingList={removeFromReadingList}
      />
    </>
  );
};

export default BlogData;

export async function getStaticPaths() {
  const response = await getAllBlogs();
  const paths = response.map((blog: any) => {
    return {
      params: {
        blog: blog.slug.current,
      },
    };
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const data = await getSingleBlog(context.params.blog);
  return {
    props: {
      blogData: data,
    },
    revalidate: 10,
  };
}
