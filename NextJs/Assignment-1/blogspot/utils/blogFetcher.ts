import client from "./sanityConfig";

export async function getAllBlogs() {
  const data = await client.fetch(`*[_type=='post']{
        _id,
        title,
        slug,
        mainImage{
          asset->{
            _id,
            url
          }
        },
        categories[]->{
          title
        }
      }`);
  return data;
}

export async function getSingleBlog(slug: string) {
  const data = await client.fetch(
    `*[_type=='post' && slug.current==$slug]{
    _id,
    title,
    slug,
    mainImage{
      asset->{
        _id,
        url
      }
    },
    categories[]->{
      title
    },
    body,
    author->{
      name,
      image{
        asset->{
          url
        }
      }
    }
  }
`,
    {
      slug,
    }
  );
  return data;
}

export async function getBookmarkBlogs(slugs: any) {

  const data = await client.fetch(`*[_type == 'post' && (slug.current in $slugs)]{
  
    _id,
    title,
    slug,
    mainImage{
      asset->{
        _id,
        url
      }
    },
    categories[]->{
      title
    },
    author->{
      name,
      image{
        asset->{
          url
        }
      }
    }
  }`, {
    slugs,
  })
  return data;
}


export const mockLoginApi = async () => {
  let res = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_RESTPOINT}/users/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: process.env.MOCK_EMAIL,
        password: process.env.MOCK_PASSWORD,
        // expiresInMins: 60, // optional
      }),
    }
  );

  const user = await res.json();
  if (!user || user.message)
    return null;

  return user;
}
