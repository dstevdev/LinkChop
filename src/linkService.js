import supabase from "./supabaseClient";

export const saveShortLink = async (originalUrl, hash, expiry) => {
  const { data, error } = await supabase.rpc("chop_link_with_limit", {
    target_url: originalUrl,
    url_hash: hash,
    url_expiry: expiry,
  });

  return { data, error };
};
