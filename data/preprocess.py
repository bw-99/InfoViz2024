import argparse
import datetime
import pandas as pd
import os
import numpy as np
import random
import re


def load_list(fname):
    list_ = []
    with open(fname, encoding="utf-8") as f:
        for line in f.readlines():
            list_.append(line.strip())
    return list_


class movielens_1m(object):
    def __init__(self,  ):
        self.size = 10
        
        # try:
        #     os.mkdir("./dataset/movielens/train")
        #     os.mkdir("./dataset/movielens/val")
        #     os.mkdir("./dataset/movielens/test")     
        # except:
        #     pass
        
        self.user_data, self.item_data, self.score_data = self.load()


        
    def make_dataset(self,):
        self.user_data, self.item_data, self.score_data = self.load()
        
        # self.item_data = self.item_encoding(self.item_data)
        # self.user_data = self.user_encoding(self.user_data)
        
        # self.filter_user()
        # self.get_support_vector(SIZE=self.size )
        

    def load(self):
        path = "./movielens/ml-1m"
        profile_data_path = "{}/users.dat".format(path)
        score_data_path = "{}/ratings.dat".format(path)
        item_data_path = "{}/movies_extrainfos.dat".format(path)

        profile_data = pd.read_csv(
            profile_data_path, names=['user_id', 'gender', 'age', 'occupation_code', 'zip'], 
            sep="::", engine='python'
        )
        
        score_data = pd.read_csv(
            score_data_path, names=['user_id', 'item_id', 'rating', 'timestamp'],
            sep="::", engine='python'
        )

        # item_cols = ['item_id', 'item_title', 'item_genres']
        item_cols = ['item_id', 'item_title', 'year', 'rate', 'released', 'item_genres', 'director', 'writer', 'actors', 'plot', 'poster']

        item_data = pd.read_csv(
            item_data_path, names=item_cols, 
            sep="::", engine='python', encoding="utf-8"
        )

        df = pd.merge(item_data, score_data, on="item_id", how="inner")
        df = df.groupby(item_cols).agg({
            "user_id": lambda x: x.tolist(),
            "rating": lambda x: x.tolist(),
            "timestamp": lambda x: x.tolist()
        }).reset_index()
        
        df["item_id"] = [i for i in range(len(df))]
        
        item_data = df[item_cols]
        score_data = df.explode(["user_id", "rating", "timestamp"])[["user_id", "item_id", "rating", "timestamp"]]
        score_data = score_data.sort_values(by="timestamp").reset_index(drop=True)
        return profile_data, item_data, score_data
    
    def item_encoding(self, item_data):
        item_fea_hete = []
        item_fea_homo = []
        m_directors = []
        m_actors = []
        genre_feat = []

        input_dir = "./dataset/movielens/ml-1m/extra"
        rate_list = load_list("{}/m_rate.txt".format(input_dir))
        genre_list = load_list("{}/m_genre.txt".format(input_dir))
        actor_list = load_list("{}/m_actor.txt".format(input_dir))
        director_list = load_list("{}/m_director.txt".format(input_dir))

        for idx, row in item_data.iterrows():
            m_info = self.item_extra_converting(row, rate_list, genre_list, director_list, actor_list)
            item_fea_hete.append(m_info[0])
            item_fea_homo.append(m_info[1])
            m_directors.append(m_info[2])
            m_actors.append(m_info[3])
            genre_feat.append(m_info[4])

        item_data["item_fea_hete"] = item_fea_hete
        item_data["item_fea_homo"] = item_fea_homo
        item_data["m_directors"] = m_directors
        item_data["m_actors"] = m_actors

        print(item_data)
        item_data["item_feature"] = genre_feat

        self.item_cols = ["item_id", "item_feature", "item_fea_hete", "item_fea_homo", "m_directors", "m_actors"]

        item_data = item_data[self.item_cols]
        return item_data
    
    def user_encoding(self, profile_data):
        input_dir = "./dataset/movielens/ml-1m/extra"

        gender_list = load_list("{}/m_gender.txt".format(input_dir))
        age_list = load_list("{}/m_age.txt".format(input_dir))
        occupation_list = load_list("{}/m_occupation.txt".format(input_dir))
        zipcode_list = load_list("{}/m_zipcode.txt".format(input_dir))

        gender_np = pd.get_dummies(profile_data["gender"]).astype(int).to_numpy()
        age_np = pd.get_dummies(profile_data["age"]).astype(int).to_numpy()
        occ_np = pd.get_dummies(profile_data["occupation_code"]).astype(int).to_numpy()
        zip_np = pd.get_dummies(profile_data["zip"]).astype(int).to_numpy()
        print("gender_np shape, ", gender_np.shape)
        print("age_np shape, ", age_np.shape)
        print("occ_np shape, ", occ_np.shape)
        print("zip_np shape, ", zip_np.shape)
        
        user_feature = np.concatenate([gender_np, age_np, occ_np, zip_np], axis=1)

        user_extra_feat = []
        for idx, row in profile_data.iterrows():
            u_info = self.user_extra_converting(row, gender_list, age_list, occupation_list, zipcode_list)
            user_extra_feat.append(u_info)
        # user_extra_feat = np.concatenate(user_extra_feat)

        profile_data["user_feature"] = user_feature.tolist()
        profile_data["user_extra_feature"] = user_extra_feat
        self.user_cols = ["user_id", "user_feature", "user_extra_feature"]
        profile_data = profile_data[self.user_cols]
        return profile_data
    
    def item_extra_converting(self, row, rate_list, genre_list, director_list, actor_list):
        rate_idx = torch.tensor([[rate_list.index(str(row['rate']))]]).long()
        genre_idx = torch.zeros(1, 25).long()
        for genre in str(row['item_genres']).split(", "):
            idx = genre_list.index(genre)
            genre_idx[0, idx] = 1  # one-hot vector
        director_idx = torch.zeros(1, 2186).long()
        director_id = []
        for director in str(row['director']).split(", "):
            idx = director_list.index(re.sub(r'\([^()]*\)', '', director))
            director_idx[0, idx] = 1
            director_id.append(idx+1)  # id starts from 1, not index
        actor_idx = torch.zeros(1, 8030).long()
        actor_id = []
        for actor in str(row['actors']).split(", "):
            idx = actor_list.index(actor)
            actor_idx[0, idx] = 1
            actor_id.append(idx+1)
        return torch.cat((rate_idx, genre_idx), 1).squeeze().tolist(), torch.cat((rate_idx, genre_idx, director_idx, actor_idx), 1).squeeze().tolist(), director_id, actor_id, genre_idx.squeeze().tolist()

    def user_extra_converting(self, row, gender_list, age_list, occupation_list, zipcode_list):
        gender_idx = torch.tensor([[gender_list.index(str(row['gender']))]]).long()
        age_idx = torch.tensor([[age_list.index(str(row['age']))]]).long()
        occupation_idx = torch.tensor([[occupation_list.index(str(row['occupation_code']))]]).long()
        zip_idx = torch.tensor([[zipcode_list.index(str(row['zip'])[:5])]]).long()
        return torch.cat((gender_idx, age_idx, occupation_idx, zip_idx), 1).squeeze().tolist()  # (1, 4)

    
    def filter_user(self):
        df = self.score_data
        df = df.groupby("user_id").agg({
            "item_id": lambda x: x.tolist(),
            "rating": lambda x: x.tolist(),
            "timestamp": lambda x: x.tolist()
        }).reset_index()

        df["pos_len"] = df["rating"].apply(lambda x: len([item for item in x if item >= 4]))
        df["rate_len"] = df["rating"].apply(lambda x: len([item for item in x]))

        # selected_user_id = df[(df["rate_len"] >= 20)]["user_id"].tolist()
        if(self.pref):
            print("pref")
            selected_user_id = df[(df["pos_len"] >= self.size) & (df["rate_len"] >= 10)]["user_id"].tolist()
        else:
            print("support")
            selected_user_id = df[(df["rate_len"] >= self.size + 2)]["user_id"].tolist()

        
        tmp_df = pd.merge(self.user_data, df, on="user_id", how="inner")
        tmp_df = tmp_df[tmp_df["user_id"].isin(selected_user_id)].reset_index(drop=True)
        tmp_df = tmp_df.sample(frac=1.0).reset_index(drop=True)
        
        tmp_df["user_id"] = [i for i in range(len(tmp_df))]
        
        self.user_data = tmp_df[self.user_cols].reset_index(drop=True)
        self.score_data = tmp_df.explode(["item_id", "rating", "timestamp"])[["user_id", "item_id", "rating", "timestamp"]].reset_index(drop=True)
        self.score_data = self.score_data.sort_values(by="timestamp")
    
    def sample_from_edg(self, edf, SIZE, type="train"):
        edf = (edf.groupby("user_id")).agg({
            "item_id": lambda x: x.tolist(),
            "rating": lambda x: x.tolist(),
        }).reset_index()
        
        support_eid, support_score, query_eid, query_score, graph_support_eid, graph_support_score = [], [], [], [], [], []
        teacher_support_eid, teacher_support_score, teacher_query_eid, teacher_query_score = [], [], [], []
        
        for idx, row in edf.iterrows():
            user_id = row["user_id"]
            used_keyword_lst = np.array(row["item_id"])
            score_lst = np.array(row["rating"])
            
            teacher_query_eid.append(np.array([
                [user_id] * len(used_keyword_lst), 
                used_keyword_lst
            ]))
            teacher_query_score.append(score_lst)
            
            # gt edge
            teacher_pos_idx = np.where(score_lst >= 4)[0]
            teacher_support_eid.append(np.array([
                [user_id] * len(teacher_pos_idx), 
                used_keyword_lst[teacher_pos_idx]
            ]))
            teacher_support_score.append(score_lst[teacher_pos_idx])
            
            selected_eidx = np.array([i for i in range(SIZE)])
            # selected_eidx = np.random.choice([i for i in range(len(row["item_id"]))], size=SIZE, replace=False)
            not_selected_eidx = np.setdiff1d([i for i in range(len(row["item_id"]))], selected_eidx)

            support_edge = used_keyword_lst[selected_eidx]
            support_rate = score_lst[selected_eidx]
            
            # support edge
            support_eid.append(np.array([
                [user_id] * len(support_edge), 
                support_edge
            ]))
            support_score.append(support_rate)
            
            # query edge            
            query_eid.append(np.array([
                [user_id] * len(used_keyword_lst[not_selected_eidx]), 
                used_keyword_lst[not_selected_eidx]
            ]))
            query_score.append(score_lst[not_selected_eidx])
            
            # support edge for graph
            if(self.pref):
                # pos_idx = np.where(score_lst >= 4)[0]
                pos_idx = np.argsort(score_lst)[::-1][:SIZE]

                pos_item = used_keyword_lst[pos_idx]
                pos_score = score_lst[pos_idx]

                graph_support_edge = pos_item
                graph_support_rate = pos_score
                
                graph_support_eid.append(np.array([
                    [user_id] * len(graph_support_edge), 
                    graph_support_edge
                ]))
                graph_support_score.append(graph_support_rate)
            else:
                graph_selected_idx = np.where(support_rate >= 4)[0]
                graph_support_edge = support_edge[graph_selected_idx]
                graph_support_rate = support_rate[graph_selected_idx]
                
                graph_support_eid.append(np.array([
                    [user_id] * len(graph_support_edge), 
                    graph_support_edge
                ]))
                graph_support_score.append(graph_support_rate)
            
        support_eid = np.concatenate(support_eid, axis=1) 
        support_score = np.concatenate(support_score, axis=0) 
        
        query_eid = np.concatenate(query_eid, axis=1) 
        query_score = np.concatenate(query_score, axis=0) 
        
        graph_support_eid = np.concatenate(graph_support_eid, axis=1) 
        graph_support_score = np.concatenate(graph_support_score, axis=0) 
        
        teacher_support_eid = np.concatenate(teacher_support_eid, axis=1) 
        teacher_support_score = np.concatenate(teacher_support_score, axis=0) 
        
        teacher_query_eid = np.concatenate(teacher_query_eid, axis=1) 
        teacher_query_score = np.concatenate(teacher_query_score, axis=0) 
        
        if(type=="val"):
            train_graph_support_eid = np.load("./dataset/movielens/train/graph_support_eid.npy")
            train_graph_support_score = np.load("./dataset/movielens/train/graph_support_score.npy")
            graph_support_eid = np.concatenate([train_graph_support_eid, graph_support_eid], axis=-1)
            graph_support_score = np.concatenate([train_graph_support_score, graph_support_score], axis=-1)
            
            train_teacher_support_eid = np.load("./dataset/movielens/train/teacher_support_eid.npy")
            train_teacher_support_score = np.load("./dataset/movielens/train/teacher_support_score.npy")
            teacher_support_eid = np.concatenate([train_teacher_support_eid, teacher_support_eid], axis=-1)
            teacher_support_score = np.concatenate([train_teacher_support_score, teacher_support_score], axis=-1)

        elif(type=="test"):
            val_graph_support_eid = np.load("./dataset/movielens/val/graph_support_eid.npy")
            val_graph_support_score = np.load("./dataset/movielens/val/graph_support_score.npy")
            graph_support_eid = np.concatenate([val_graph_support_eid, graph_support_eid], axis=-1)
            graph_support_score = np.concatenate([val_graph_support_score, graph_support_score], axis=-1)

            val_teacher_support_eid = np.load("./dataset/movielens/val/teacher_support_eid.npy")
            val_teacher_support_score = np.load("./dataset/movielens/val/teacher_support_score.npy")
            teacher_support_eid = np.concatenate([val_teacher_support_eid, teacher_support_eid], axis=-1)
            teacher_support_score = np.concatenate([val_teacher_support_score, teacher_support_score], axis=-1)
        
        np.save(f"./dataset/movielens/{type}/support_eid.npy", support_eid)
        np.save(f"./dataset/movielens/{type}/support_score.npy", support_score)
        np.save(f"./dataset/movielens/{type}/query_eid.npy", query_eid)
        np.save(f"./dataset/movielens/{type}/query_score.npy", query_score)
        
        np.save(f"./dataset/movielens/{type}/graph_support_eid.npy", graph_support_eid)
        np.save(f"./dataset/movielens/{type}/graph_support_score.npy", graph_support_score)
        
        np.save(f"./dataset/movielens/{type}/teacher_support_eid.npy", teacher_support_eid)
        np.save(f"./dataset/movielens/{type}/teacher_support_score.npy", teacher_support_score)
        
        np.save(f"./dataset/movielens/{type}/teacher_query_eid.npy", teacher_query_eid)
        np.save(f"./dataset/movielens/{type}/teacher_query_score.npy", teacher_query_score)

    def get_support_vector(self, SIZE):
        print(SIZE)
        user_length = len(self.user_data)

        train_pivot, val_pivot, test_pivot = 0.8, 0.9, 1.0
        train_count, val_count, test_count = int(user_length*train_pivot), int(user_length*val_pivot), int(user_length*test_pivot)

        train_udf, val_udf, test_udf = self.user_data.iloc[:train_count],  self.user_data.iloc[train_count:val_count], self.user_data.iloc[val_count:test_count]
        graph_train_udf, graph_val_udf, graph_test_udf = self.user_data.iloc[:train_count], self.user_data.iloc[:val_count], self.user_data.iloc[:test_count]
        
        train_udf.to_pickle(f"./dataset/movielens/train/udf.pkl")
        train_udf.to_csv(f"./dataset/movielens/train/udf.csv", index=False)

        graph_train_udf.to_pickle(f"./dataset/movielens/train/graph_udf.pkl")
        graph_train_udf.to_csv(f"./dataset/movielens/train/graph_udf.csv", index=False)

        val_udf.to_pickle(f"./dataset/movielens/val/udf.pkl")
        val_udf.to_csv(f"./dataset/movielens/val/udf.csv", index=False)

        graph_val_udf.to_pickle(f"./dataset/movielens/val/graph_udf.pkl")
        graph_val_udf.to_csv(f"./dataset/movielens/val/graph_udf.csv", index=False)

        test_udf.to_pickle(f"./dataset/movielens/test/udf.pkl")
        test_udf.to_csv(f"./dataset/movielens/test/udf.csv", index=False)

        graph_test_udf.to_pickle(f"./dataset/movielens/test/graph_udf.pkl")
        graph_test_udf.to_csv(f"./dataset/movielens/test/graph_udf.csv", index=False)
        
        self.item_data.to_pickle(f"./dataset/movielens/idf.pkl")
        self.item_data.to_csv(f"./dataset/movielens/idf.csv", index=False)

        # print(train_udf, test_udf)
        
        train_edf, val_edf, test_edf = pd.merge(train_udf, self.score_data, on="user_id", how="inner"), pd.merge(val_udf, self.score_data, on="user_id", how="inner"), pd.merge(test_udf, self.score_data, on="user_id", how="inner")

        self.sample_from_edg(train_edf, type="train", SIZE=SIZE)
        self.sample_from_edg(val_edf, type="val", SIZE=SIZE)
        self.sample_from_edg(test_edf, type="test", SIZE=SIZE)
        

dataset = movielens_1m()
# dataset.make_dataset()

print("#"*10 + "dataset created" + "#"*10)
